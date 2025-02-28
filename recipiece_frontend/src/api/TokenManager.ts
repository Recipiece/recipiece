import { RefreshTokenResponseSchema } from "@recipiece/types";
import axios, { AxiosHeaders } from "axios";
import { jwtDecode } from "jwt-decode";
import { DateTime } from "luxon";
import { StorageKeys } from "../util";

/**
 * This class intentionally sits outside of the state/render system.
 * We want to lazily make a refresh token call when the access token is about to expire,
 * BUT we don't want to send that call a bunch of times, we only want it once when needed.
 *
 * I also wrote this at 2330 on a weeknight over a holiday so probably a little janky but it works.
 *
 * The past has come back to bite me. Using Promise.race was a bad idea. Instead, we'll just hold onto one single promise.
 */
export class TokenManager {
  public static instance: TokenManager;

  public get isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  public set rememberUser(newVal: boolean | undefined | null) {
    if (newVal) {
      localStorage.setItem(StorageKeys.REMEMBER_USER, "Y");
    } else {
      localStorage.removeItem(StorageKeys.REMEMBER_USER);
    }
  }

  public get rememberUser(): boolean {
    return localStorage.getItem(StorageKeys.REMEMBER_USER) === "Y";
  }

  public set accessToken(newVal: string | undefined | null) {
    if (newVal) {
      sessionStorage.setItem(StorageKeys.ACCESS_TOKEN, JSON.stringify(newVal));
    } else {
      sessionStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    }
  }

  public set refreshToken(newVal: string | undefined | null) {
    if (newVal) {
      if (this.rememberUser) {
        localStorage.setItem(StorageKeys.REFRESH_TOKEN, JSON.stringify(newVal));
      } else {
        sessionStorage.setItem(StorageKeys.REFRESH_TOKEN, JSON.stringify(newVal));
      }
    } else {
      localStorage.removeItem(StorageKeys.REFRESH_TOKEN);
    }
  }

  public get accessToken(): string | undefined {
    const item = sessionStorage.getItem(StorageKeys.ACCESS_TOKEN);
    if (item) {
      return JSON.parse(item);
    }
    return undefined;
  }

  public get refreshToken(): string | undefined {
    let item = undefined;
    if (this.rememberUser) {
      item = localStorage.getItem(StorageKeys.REFRESH_TOKEN);
    } else {
      item = sessionStorage.getItem(StorageKeys.REFRESH_TOKEN);
    }
    if (item) {
      return JSON.parse(item);
    }
    return undefined;
  }

  public clear() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  public static getInstance(): TokenManager {
    if (!this.instance) {
      this.instance = new TokenManager();
    }
    return this.instance;
  }

  private constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private refreshPromise: Promise<any> | null = null
  ) {}

  private async runRefresh() {
    const headers = new AxiosHeaders();
    headers.set("Authorization", `Bearer ${this.refreshToken}`);
    headers.set("Content-Type", "application/json");
    const response = await axios.post(
      `${process.env.RECIPIECE_API_URL!}/user/refresh-token`,
      {},
      {
        headers: headers,
      }
    );
    if (response.status === 200) {
      // huzzah, we have new tokens. Set them in the context and then surface them to the caller
      const responseData = response.data as RefreshTokenResponseSchema;
      sessionStorage.setItem(StorageKeys.ACCESS_TOKEN, JSON.stringify(responseData.access_token));
      if (responseData.refresh_token !== this.refreshToken) {
        localStorage.setItem(StorageKeys.REFRESH_TOKEN, JSON.stringify(responseData.refresh_token));
      }
      return responseData;
    } else {
      // some error occurred, so don't turn back any tokens
      return { access_token: this.accessToken, refresh_token: this.refreshToken };
    }
  }

  public async resolveTokens(): Promise<{ readonly refresh_token?: string; readonly access_token?: string }> {
    if (this.accessToken) {
      const decodedAccessToken = jwtDecode(this.accessToken);
      if (decodedAccessToken.exp) {
        const expiry = DateTime.fromSeconds(decodedAccessToken.exp, {
          zone: "utc",
        });
        const isWithinFiveMinutesOfExpiry = expiry.diff(DateTime.utc()).toMillis() < 5 * 60 * 1000;
        if (isWithinFiveMinutesOfExpiry && !!this.refreshToken) {
          if (this.refreshPromise === null) {
            this.refreshPromise = this.runRefresh().finally(() => (this.refreshPromise = null));
          }
          return this.refreshPromise;
        } else if (expiry.diffNow().toMillis() > 0) {
          // their access token wasn't expired, so move them along
          return { access_token: this.accessToken, refresh_token: this.refreshToken };
        }
      }
    } else if (this.refreshToken) {
      // okay, they didn't have an access token. If they have a non-expired refresh token, run the refresh
      const decodedRefreshToken = jwtDecode(this.refreshToken);
      if (decodedRefreshToken.exp) {
        const expiry = DateTime.fromSeconds(decodedRefreshToken.exp);
        if (expiry.diffNow().toMillis() > 0) {
          // it wasn't expired! send the request
          if (this.refreshPromise === null) {
            this.refreshPromise = this.runRefresh().finally(() => (this.refreshPromise = null));
          }
          return this.refreshPromise;
        }
      }
    }
    // sorry, can't help you out now
    return { access_token: this.accessToken, refresh_token: this.refreshToken };
  }
}

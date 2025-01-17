import { FC } from "react";
import { H2, List, Stack } from "../../../component";

export const AboutTab: FC = () => {
  return (
    <Stack>
      <H2>Recipiece</H2>
      <p className="text-sm">
        Recipiece is built in React and hosted on{" "}
        <a className="underline" href="https://www.digitalocean.com/">
          Digital Ocean
        </a>
        . Database hosting is provided by{" "}
        <a className="underline" href="https://app.xata.io">
          Xata
        </a>
        . The API services are written in NodeJS and Python (using FastAPI).
      </p>
      <p className="text-sm">
        Recipiece stands on the shoulders of giants. We make use of the following notable libraries and frameworks:
        <List>
          <>
            <a className="underline" href="https://github.com/hhursev/recipe-scrapers">
              Recipe Scrapers
            </a>
          </>
          <>
            <a className="underline" href="https://github.com/strangetom/ingredient-parser">
              Ingredient Parser
            </a>
          </>
          <>
            <a className="underline" href="https://ui.shadcn.com/">
              shadcn/ui
            </a>
            ,{" "}
            <a className="underline" href="https://github.com/radix-ui">
              RadixUI
            </a>
            , and{" "}
            <a className="underline" href="https://lucide.dev/">
              Lucide
            </a>
          </>
          <>
            <a className="underline" href="https://docs.bullmq.io/">
              BullMQ
            </a>
          </>
          <>
            <a className="underline" href="https://nginx.org/">
              Nginx
            </a>
          </>
          <>
            <a className="underline" href="https://tanstack.com/query/v5/docs/framework/react/overview">
              TanStack Query
            </a>
          </>
          <>
            <a className="underline" href="https://moment.github.io/luxon/#/">
              Luxon
            </a>
          </>
          <>
            <a className="underline" href="https://fastapi.tiangolo.com/">
              FastAPI
            </a>
          </>
          <>
            <a className="underline" href="https://www.npmjs.com/package/convert-units">convert-units</a>
          </>
        </List>
        The initial list of ingredients for weight-to-volume conversions is based off of King Arthur Baking&apos;s{" "}
        <a className="underline" href="https://www.kingarthurbaking.com/learn/ingredient-weight-chart">
          Ingredient Weight Chart
        </a>
        .
      </p>

      <p className="text-sm">
        Interested in helping develop Recipiece? Found a bug perhaps?{" "}
        <a className="underline" target="blank" href="https://github.com/sjyn/Recipiece">
          Find us on GitHub
        </a>
        .
      </p>
      <p className="text-sm">
        Version <i>{process.env.RECIPIECE_VERSION}</i>, December 2024
      </p>
    </Stack>
  );
};

export const lazyRequestNotificationsPermissions = async (evenWhenDenied = false) => {
  return new Promise<"granted" | "denied" | "nothing">((resolve, reject) => {
    if ("Notification" in window) {
      const hasBeenExplicitlyDenied = Notification.permission === "denied";
      const hasBeenGranted = Notification.permission === "granted";
      if (hasBeenGranted) {
        resolve("nothing");
      } else {
        // show the message if the user has not explicitly denied the permission before,
        // or, if we want to pester them (jk) then show it anyways
        if (!hasBeenExplicitlyDenied || evenWhenDenied) {
          Notification.requestPermission()
            .then((permission) => {
              if (permission === "granted") {
                resolve("granted");
              } else {
                resolve("denied");
              }
            })
            .catch(() => {
              reject();
            });
        } else {
          resolve("nothing");
        }
      }
    } else {
      // nothing to do here, just keep on trucking
      reject();
    }
  });
};

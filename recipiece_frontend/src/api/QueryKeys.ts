import { Query } from "@tanstack/react-query";

export type RcpQueryKey = [string, ...{ readonly [key: string]: any }[]];

export function oldDataUpdater<DataArrayType extends { id: number }>(updatedItem: DataArrayType) {
  return (oldData: { data: DataArrayType[] } | undefined) => {
    if (oldData) {
      const indexOfUpdatedRecord = oldData.data.findIndex((r) => r.id === updatedItem.id);
      const newData = [...oldData.data.splice(0, indexOfUpdatedRecord), { ...updatedItem }, ...oldData.data.splice(indexOfUpdatedRecord + 1)];
      return {
        ...oldData,
        data: [...newData],
      };
    }
    return undefined;
  };
}

export function oldDataCreator<DataArrayType extends { id: number }>(createdItem: DataArrayType) {
  return (oldData: { data: DataArrayType[] } | undefined) => {
    if (oldData) {
      return {
        ...oldData,
        data: [{ ...createdItem }, ...oldData.data],
      };
    }
    return undefined;
  };
}

export function oldDataDeleter<DataArrayType extends { id: number }>(deletedItem: DataArrayType) {
  return (oldData: { data: DataArrayType[] } | undefined) => {
    if (oldData) {
      return {
        ...oldData,
        data: [...oldData.data.filter((r) => r.id !== deletedItem.id)],
      };
    }
    return undefined;
  };
}

export const generatePartialMatchPredicate = (partialQueryKey: RcpQueryKey) => {
  return (query: Query) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, ...restPartialKeys] = partialQueryKey;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [__, ...restQueryKeys] = query.queryKey as RcpQueryKey;

    for (let i = 0; i < restPartialKeys.length; i++) {
      const partialKeyObject = restPartialKeys[i];
      const partialKey = Object.keys(partialKeyObject)[0];
      const partialVal = Object.values(partialKeyObject)[0];
      const presentInRestQueryKeys = restQueryKeys.find((val) => {
        if (partialKey in val) {
          const valAtKey = val[partialKey];
          if (Array.isArray(valAtKey) && Array.isArray(partialVal)) {
            return valAtKey.every((v) => partialVal.includes(v));
          } else {
            return val[partialKey] === partialVal;
          }
        }
        return false;
      });
      if (!presentInRestQueryKeys) {
        return false;
      }
    }
    return true;
  };
};

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

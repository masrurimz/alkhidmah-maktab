export const checkIsValidObjectId = (id = ""): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  return Number(id.match(objectIdRegex)?.length) > 0;
};

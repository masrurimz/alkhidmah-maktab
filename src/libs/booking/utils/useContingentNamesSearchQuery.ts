import { useState } from "react";
import { useDebounce } from "usehooks-ts";
import { api } from "../../../utils";

export const useContingentNamesSearchQuery = () => {
  const [contingentNameQuery, setContingentNameQuery] = useState("");
  const debounceContingentNameQuery = useDebounce(contingentNameQuery, 300);
  const contingentNames = api.booking.filterContingentName.useQuery({
    name: debounceContingentNameQuery,
  });
  const contingentNamesUniqueSelectOptions = contingentNames.data
    ? [...new Set(contingentNames.data?.map((c) => c.contingentName))].map(
        (c) => ({
          label: c,
          value: c,
        })
      )
    : [];

  return {
    contingentNamesUniqueSelectOptions,
    contingentNameQuery,
    contingentNames,
    debounceContingentNameQuery,
    setContingentNameQuery,
  };
};

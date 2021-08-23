import axios from "axios";
import getCoordsFromAddress from "./getCoordsFromAddress";

const onSearch = async (value) => {
    const addressInfo = await getCoordsFromAddress(value);
    if (
      addressInfo?.data?.results[0]?.types &&
      addressInfo.data.results[0].types.some(
        (type) =>
          type === "street_address" ||
          type === "geocode" ||
          type === "postal_code" ||
          type === "premise" ||
          type === "intersection" ||
          type === "route"
      )
    ) {
      console.log("valid query");
    } else {
      console.log("invalid query");
    }
  };
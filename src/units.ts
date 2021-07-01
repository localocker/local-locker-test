import axios from "axios";

type Unit = {
  id: number;
  unit_number: number;
  unit_category: number;
  status: "booked" | "available";
  created: string;
};

type UnitCategory = {
  id: number;
  status: "booked" | "available";
  is_hiddden: boolean;
  size: string;
  details: string;
  price: string;
  units: Unit[];
};

const renderUnitSkeleton = () => {
  return `
    <tr>
    <td>
      <div class="skeleton h-6 w-36"></div>
    </td>
    <td>
    <div class="skeleton h-6 w-24"></div>
    </td>
    <td>
    <div class="skeleton h-6 w-24"></div>
    </td>
    <td class="flex justify-center">
    <div class="skeleton h-6 w-32 "></div>
    </td>
  </tr>
    `;
};

const renderUnitRow = (uc: UnitCategory) => {
  return `
    <tr>
    <td>
      ${uc.size}
    </td>
    <td>
      Available
    </td>
    <td>
      $${uc.price}
    </td>
    <td class="flex justify-center">
      <a class="btn btn-primary w-32">
        Book Now
      </a>
    </td>
  </tr>
    `;
};

const fetchUnitCategories = async (id) => {
  const res = await axios.get(`https://admin.localocker.com/location/${id}/`);
  const { data } = res;
  console.log(data);
  return data.unit_categories as UnitCategory[];
};

const renderUnits = async () => {
  const tableBodyContainer = document.getElementById("units-table-body");

  //   Load Skeleton
  tableBodyContainer.innerHTML = renderUnitSkeleton().repeat(3);

  // Run API Request
  const unitCategories = await fetchUnitCategories(48);
  unitCategories.forEach((u) => console.log(u));

  //Load Content
  tableBodyContainer.innerHTML = unitCategories
    .filter((uc) => uc.status === "available")
    .map((uc) => renderUnitRow(uc))
    .join("");
};

document.addEventListener("DOMContentLoaded", function (event) {
  //do work
  console.log("DOM LOADED");
  renderUnits();
});

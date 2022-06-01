import axios from "axios";
import $ from "jquery";

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}


type Unit = {
  id: number;
  unit_number: number;
  unit_category: number;
  status: "booked" | "available";
  created: string;
  offline_flag: boolean;
};


type UnitCategory = {
  id: number;
  status: "booked" | "available" | "available through clutter";
  status_text: string;
  is_hidden: boolean;
  join_waitlist: boolean;
  size: string;
  details: string;
  link: string;
  price: string;
  image: string;
  color: string;
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

//@ts-ignore
window.showWaitlistModal = () => {
  $("#waitlist-modal").show();
};

//@ts-ignore
window.showClutterModal = () => {
  $("#clutter-modal").show();
};

const renderUnitRow = (uc: UnitCategory) => {
  
  //https://staging-fe.localocker.com/booking/?id=610&size=3x1x2&price=510.98&key=91&deals=&[%E2%80%A6]n%2C+NY%2C+11201&book_now=true&locationPath=X-888%2F49
  
  // const cta =
  //   uc.status === "available"
  //     ? `<a class="btn btn-primary w-32" href="https://booking.localocker.com/booking/1?unitCategory=${uc.id}">
  //       Book Now
  //     </a>`
  //     : `<button class="btn btn-secondary w-32" onclick="showWaitlistModal()">
  //       Join Waitlist
  //     </button>`;
  
  // https://staging-fe.localocker.com/booking/?id=610&size=3x1x2&price=510.98&book_now=true&locationPath=X-888%2F49
    //get path name for return URL on booking page
    const path = window.location.pathname.replace(/^\//, '');
    // get address for location details on bookin page
    const address = document.getElementById('address').innerText;
    var unitID;
    var availableUnits = [];
    uc.units.forEach(function (unit) {
      if (unit.status === "available" && unit.offline_flag === false) {
        // console.log("available unit ", unit);
        availableUnits.push(unit);
      }
    });
    // console.log(availableUnits);
    if (availableUnits.length > 0)
    {
      unitID = availableUnits[0].id;
    }

    var cta = "";
    var status_text = String(uc.status);
    if (uc.status === "available through clutter") {
      //cta = `<button class="flex flex-col btn bg-white text-clutter border-2 border-clutter gap-0 pb-3 rounded-lg flex-wrap focus:bg-clutter w-full xs:w-32" onclick="showClutterModal()"><div>Book With</div><img src="/images/clutter-logo.svg" class="pt-1" width="68" height=""16></button>`;
      status_text = uc.status_text;
      cta = `<a href=${uc.link} target="_blank"><button class="flex flex-col btn bg-white border-2 border-clutter gap-0 pb-3 rounded-lg flex-wrap w-full xs:w-32" style="color:${uc.color}; border-color: ${uc.details};">${uc.details}<img src=${uc.image} class="pt-1" style="" width="68" height=""16></button></a>`;
    } else {
      uc.status_text = String(uc.status);
      cta = uc.status === "available" 
        ? `<a class="btn btn-primary rounded-lg w-full xs:w-32" href="https://booking.localocker.com/booking/1?id=${unitID}&size=${uc.size}&price=${uc.price}&book_now=true&locationAddress=${address}&locationPath=${path}">
          Book Now
        </a>`
        : `<button class="btn btn-secondary border-2 rounded-lg w-full xs:w-32" onclick="showWaitlistModal()">
          Join Waitlist
        </button>`;
    }

 
  return `
    <tr class="">
    <td class="">
      ${uc.size}
    </td>
    <td class="hidden md:block">
      ${toTitleCase(uc.status_text)}
    </td>
    <td class="">
      ${uc.price}
    </td>
    <td class="details-column align-middle md:align-baseline">
      ${cta}
    </td>
  </tr>
    `;
};

const fetchUnitCategories = async (id) => {
  const res = await axios.get(`https://admin.localocker.com/location/${id}/`);
  const { data } = res;
  return data.unit_categories as UnitCategory[];
};

const renderUnits = async () => {
  const tableBodyContainer = document.getElementById("units-table-body");

  //   Load Skeleton
  tableBodyContainer.innerHTML = renderUnitSkeleton().repeat(3);

  // Run API Request
  var script_tag = document.getElementById('units-script');
  var entityId = script_tag.getAttribute('data');
  const unitCategories = await fetchUnitCategories(entityId);

  // Filter down to relevant unit categories
  var filteredUnits = unitCategories.filter(uc => (uc.status === "available" && uc.is_hidden === false) || (uc.status === "booked" && uc.join_waitlist === true && uc.is_hidden === false));

  // Convert floats to int to string
  filteredUnits.forEach(uc => uc.price = parseInt(uc.price).toString());

  // Sort categories by price
  filteredUnits.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));

  // Add dollar sign to all values
  let currency = "$";
  filteredUnits.forEach(uc => uc.price = currency.concat(uc.price));

  // Clutter Variables
  var clutter0 = script_tag.getAttribute('clutter0');
  var clutter1 = script_tag.getAttribute('clutter1');
  var clutter2 = script_tag.getAttribute('clutter2');
  var clutter3 = script_tag.getAttribute('clutter3');
  var clutterLink = script_tag.getAttribute('clutterLink');
  var vendorImage = script_tag.getAttribute('vendorImage');
  var vendorColor = script_tag.getAttribute('vendorColor');
  const displayClutter = script_tag.getAttribute('displayClutter');
  var clutterUnit: UnitCategory = {
    id: 123456789,
    status: "available through clutter",
    status_text: clutter1,
    is_hidden: false,
    join_waitlist: false,
    size: clutter0,
    details: clutter3,
    link: clutterLink,
    price: clutter2,
    image: vendorImage,
    color: vendorColor,
    units: []
  };
  if (displayClutter === "true") {
    filteredUnits.push(clutterUnit);
  } else {
    // Choosing not to display Clutter unit - return nothing
  }
  
  
  //Load Content
  tableBodyContainer.innerHTML = filteredUnits.map((uc) => renderUnitRow(uc)).join("");


  // tableBodyContainer.innerHTML = unitCategories
  //   .filter(uc => (uc.status === "available" && uc.is_hidden === false) || (uc.status === "booked" && uc.join_waitlist === true && uc.is_hidden === false))
  //   .map((uc) => renderUnitRow(uc))
  //   .join("");
};


const hookupForm = () => {
  const waitlistForm = document.getElementById("waitlist-form");
  waitlistForm.onsubmit = (e) => {
    e.preventDefault();
    const formDataArray = $("#waitlist-form").serializeArray();
    const formData = {};

    formDataArray.forEach((i) => {
      formData[i.name] = i.value || "";
    });

    document.getElementById("waitlist-form");
    // console.log(formData);

    // axios.post(
    //   "https://webhook.site/#!/e4128d2d-9449-4f25-a229-c84a1945a531/008ff727-edaa-4620-bce7-5bb2c814d365/1",
    //   formData
    // );

    $("#waitlist-modal").hide();
  };
};

document.addEventListener("DOMContentLoaded", function (event) {
  //do work
  renderUnits();
  hookupForm();
});

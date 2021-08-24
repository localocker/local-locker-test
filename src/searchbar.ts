import axios from "axios";

const onSearch = async (address) => {
    const addressInfo = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDZNQlSlEIkFAct5VzUtsP4dSbvOr2bE18`
    );
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
      const site = '/?q=';
      const url = site + q.value;
      const win = window.open(url, '_self');
      win.focus();
    } else {
      alert("Please enter the ZIP code or address.");
    }
  };

  const f = document.getElementById('form');
  let q = document.getElementById('query') as HTMLInputElement;

  f.addEventListener('submit', function (event) {
    event.preventDefault();
    onSearch(q.value)
  });
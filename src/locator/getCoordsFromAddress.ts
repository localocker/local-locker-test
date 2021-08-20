import axios from 'axios';

export default async address =>
  await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDZNQlSlEIkFAct5VzUtsP4dSbvOr2bE18`
  );

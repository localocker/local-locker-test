import axios from "axios";

const starSVG =
  '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>';

const starRatings = {
  ONE: starSVG.repeat(1),
  TWO: starSVG.repeat(2),
  THREE: starSVG.repeat(3),
  FOUR: starSVG.repeat(4),
  FIVE: starSVG.repeat(5),
};

const reviewsTemplate = (
  name: string,
  stars: string,
  comment: string
) => `<div class="flex flex-col sm:flex-row border-b py-2">
<div class="sm:w-1/3 mb-1 sm:mb-0">${name}</div>
<div class="w-full">
    <div class="flex">${stars}</div>
    <p class="mt-2">${comment}</p>
</div>
</div>`;

const reviewsTemplateSkeleton = reviewsTemplate(
  '<div class="w-36 h-4 skeleton"></div>',
  '<div class="w-36 h-4 skeleton"></div>',
  '<div class="w-full h-4 skeleton"></div><div class="w-full h-4 mt-2 skeleton"></div>'
);

const populateReviewsTotalCount = (html) => {
  document.querySelectorAll(".reviews-total-count").forEach((n) => {
    n.innerHTML = html;
  });
};

const populateLocationReviewsCount = (html) => {
  document.querySelectorAll(".location-reviews-count").forEach((n) => {
    n.innerHTML = html;
  });
};

const fetchReviews = async () => {
  document.getElementById("reviews-container").innerHTML =
    reviewsTemplateSkeleton.repeat(5);
  // populateReviewsTotalCount('<div class="w-36 h-6 skeleton"></div>');
  populateLocationReviewsCount('<div class="w-36 h-6 skeleton"></div>'); 
  
  // get entity id
  var script_tag = document.getElementById('units-script');
  var entityId = script_tag.getAttribute('data');

  const res = await axios.get(`https://admin.localocker.com/location/${entityId}/`);
  const {
    data: { all_location_reviews_and_rating },
    data: { location_reviews_count },
    data: { location_rating }
  } = res;

  const { average_rating_all_locations, reviews, total_reviews_count } =
    all_location_reviews_and_rating;
  
  document.getElementById("reviews-container").innerHTML = "";

  reviews.forEach((r) => {
    document.getElementById("reviews-container").innerHTML += reviewsTemplate(
      r.reviewer.displayName,
      starRatings[r.starRating],
      r.comment
    );
  });

  populateReviewsTotalCount(`<div class="flex items-center text-ll-blue">
            <div class="flex">${starSVG.repeat(5)}</div>
            <div class="ml-2">${total_reviews_count} Reviews</div>
    </div>`);

  populateLocationReviewsCount(`<div class="flex items-center text-ll-blue">
    <div class="flex">${starSVG.repeat(5)}</div>
    <div class="ml-2">${location_reviews_count} Reviews</div>
</div>`);

};

document.addEventListener("DOMContentLoaded", function (event) {
  //do work
  fetchReviews();
});

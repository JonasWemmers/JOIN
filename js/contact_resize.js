window.addEventListener("resize", function () {
  var screenWidth = window.innerWidth;
  var content = document.getElementById("content");
  var contentMainContainer = document.getElementById("contentMainContainer");
  var contactMobileDetails = this.document.getElementById(
    "contactMobileDetails"
  );

  if (screenWidth > 1024) {
    content.classList.add("d-none");
    contentMainContainer.classList.remove("d-none");
    contactMobileDetails.classList.add("d-none");
    location.reload();
  } else {
    contentMainContainer.classList.add("d-none");
    content.classList.remove("d-none");
    contactMobileDetails.classList.remove("contactMobileDetails");
    location.reload();
  }
});

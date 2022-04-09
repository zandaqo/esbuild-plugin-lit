document.addEventListener("DOMContentLoaded", async () => {
  await import("./my-element");
  const myElement = document.createElement("my-element") as any;
  document.body.insertBefore(myElement, document.body.childNodes[0]);
});

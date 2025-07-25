/**
 * Creates an element with given tag, class name, and text content.
 * @param {string} tag The element tag name.
 * @param {string} className The class name to apply.
 * @param {string} [textContent] The text content for the element.
 * @returns {HTMLElement} The created element.
 */
export function createElement(tag, className, textContent) {
  const element = document.createElement(tag);
  element.className = className;
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}
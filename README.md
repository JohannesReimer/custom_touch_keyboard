# Custom Touch Keyboard

This repository contains a customizable virtual touch keyboard designed for web applications. It includes support for various key layouts, spacers, and dynamic behaviors. It works without any additional modules, with pure vanilla JS.

## Features
- Fully customizable key layouts including spacers.
- Support for special characters and special buttons like "backspace" and "enter".
- Dynamic handling of text input, including caret position, text selection and key hold behaviour.
- Responsive design: Keyboard adapts to screen size and page is scrolled to inout field when selected
- Touch-ready
- Vanilla JS (no libraries required)
- Easy to integrate: MWE provided in `keyboard-test.html`.

## Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Open `keyboard-test.html` in your browser to see the keyboard in action.

### Usage
- Include the `keyboard.css` and `keyboard.js` files in your project.
- Add the `use-keyboard-input` class to any input field to enable the virtual keyboard.

### Examples
Simple input field
```html
<input type="text" id="input1" class="use-keyboard-input"/>
```
Text area with corresponding clear button
```html
<textarea id="input2" class="use-keyboard-input"/>
<button id="clear-button2">Clear</button>
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

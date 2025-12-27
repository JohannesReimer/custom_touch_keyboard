// Big shoutout to @dcode for providing the base structure of the keyboard code: https://www.youtube.com/watch?v=N3cq0BHDMOY

const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false,
        capsState: "inactive",
        repeatDelay: 50,
        repeatDelayInitial: 250,
        caretPosition: 0
    },

    init() {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.setAttribute("inputmode", "none");
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });

            element.addEventListener("mouseup", () => {
                this.properties.caretPosition = element.selectionStart;
            });

            element.addEventListener("touchend", (event) => {
                this.properties.caretPosition = element.selectionStart;
            });

            element.addEventListener("input", () => {
                const caretPosition = element.selectionStart;
                const value = element.value;
                this.properties.value = value;
                this.properties.caretPosition = caretPosition;
                this.properties.valueBefore = value.slice(0, caretPosition);
                this.properties.valueAfter = value.slice(caretPosition);
            });
        });

        // Prevent context menu on long press in touch mode
        this.elements.keysContainer.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        document.addEventListener("mousedown", (event) => {
            const activeElement = document.activeElement;
            const isClickOutside = !event.target.closest(".use-keyboard-input") && !event.target.closest(".keyboard");

            if (isClickOutside && activeElement && activeElement.classList.contains("use-keyboard-input")) {
                activeElement.blur();
                this.close();
            }
        });

        this.elements.keysContainer.addEventListener("mousedown", (event) => {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains("use-keyboard-input")) {
                event.preventDefault();
                activeElement.focus();
                if (typeof activeElement.setSelectionRange === "function") {
                    activeElement.setSelectionRange(this.properties.caretPosition, this.properties.caretPosition);
                }
            }
        });

        this.elements.keysContainer.addEventListener("touchstart", (event) => {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains("use-keyboard-input")) {
                event.preventDefault();
                activeElement.focus();
                if (typeof activeElement.setSelectionRange === "function") {
                    activeElement.setSelectionRange(this.properties.caretPosition, this.properties.caretPosition);
                }
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Shift" && this.properties.capsState === "inactive") {
                this.properties.capsState = "active";
                this._toggleCapsLock();
                const capsKey = this.elements.keysContainer.querySelector(".keyboard__key--caps");
                if (capsKey) {
                    capsKey.classList.add("keyboard__key--active");
                }
                this._updateSpecialCharacters(); // Trigger update for special characters
            } else if (event.key === "CapsLock") {
                if (this.properties.capsState !== "locked") {
                    this.properties.capsState = "locked";
                } else {
                    this.properties.capsState = "inactive";
                }

                this._toggleCapsLock();

                const capsKey = this.elements.keysContainer.querySelector(".keyboard__key--caps");

                if (capsKey) {
                    if (this.properties.capsState === "locked") {
                        capsKey.classList.add("keyboard__key--active");
                        capsKey.classList.add("keyboard__key--locked");
                        capsKey.innerHTML = this.createIconHTML("keyboard_capslock");
                    } else {
                        capsKey.classList.remove("keyboard__key--active");
                        capsKey.classList.remove("keyboard__key--locked");
                        capsKey.innerHTML = this.createIconHTML("keyboard_arrow_up");
                    }
                }
                this._updateSpecialCharacters(); // Trigger update for special characters
            }
        });

        document.addEventListener("keyup", (event) => {
            if (event.key === "Shift" && this.properties.capsState === "active") {
                this.properties.capsState = "inactive";
                this._toggleCapsLock();
                const capsKey = this.elements.keysContainer.querySelector(".keyboard__key--caps");
                if (capsKey) {
                    capsKey.classList.remove("keyboard__key--active");
                }
                this._updateSpecialCharacters(); // Reset special characters
            }
        });

        this.elements.keys.forEach((key) => {
            key.addEventListener("touchstart", () => {
                key.classList.add("keyboard__key--touched");
            });

            key.addEventListener("touchend", () => {
                key.classList.remove("keyboard__key--touched");
            });
        });

        document.addEventListener("selectionchange", () => {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains("use-keyboard-input")) {
                this.properties.caretPosition = activeElement.selectionStart;
            }
        });
    },

    _createKeys() {
        const fragment = document.createDocumentFragment();
        const keyLayout = [
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "ß",
            "q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "ü",
            "a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä",
            "caps", "y", "x", "c", "v", "b", "n", "m", "backspace",
            "spacer", "space", "done"
        ];

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["ß", "ü", "ä", "backspace"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = this.createIconHTML("space_bar");

                    this._addHoldBehavior(keyElement, (valueBefore, valueAfter, caretPosition) => {
                        return { value: valueBefore + " " + valueAfter, caretPosition: caretPosition + 1};
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = this.createIconHTML("keyboard_return");

                    this._addHoldBehavior(keyElement, (valueBefore, valueAfter, caretPosition) => {
                        const activeElement = document.activeElement;
                        if (activeElement && activeElement.tagName === "INPUT" && activeElement.type === "text") {
                            // Prevent Enter key action for text input fields
                            return { value: valueBefore + valueAfter, caretPosition };
                        }

                        // Default behavior for other input types
                        return { value: valueBefore + "\n" + valueAfter, caretPosition: caretPosition + 1 };
                    });

                    break;

                case "backspace":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = this.createIconHTML("backspace");

                    this._addHoldBehavior(keyElement, (valueBefore, valueAfter, caretPosition) => {
                        const activeElement = document.activeElement;
                        if (activeElement.selectionStart !== activeElement.selectionEnd) {
                            // If text is selected, remove the selection
                            return { value: valueBefore + valueAfter, caretPosition: caretPosition };
                        } else {
                            // Otherwise, remove the character before the caret
                            const newValueBefore = valueBefore.slice(0, -1);
                            const newCaretPosition = Math.max(caretPosition - 1, 0);
                            return { value: newValueBefore + valueAfter, caretPosition: newCaretPosition };
                        }
                    });

                    break;

                case "delete":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = this.createIconHTML("delete");

                    this._addHoldBehavior(keyElement, (valueBefore, valueAfter, caretPosition) => {
                        const activeElement = document.activeElement;
                        if (activeElement.selectionStart !== activeElement.selectionEnd) {
                            // If text is selected, remove the selection
                            return { value: valueBefore + valueAfter, caretPosition: caretPosition };
                        } else {
                            // Otherwise, remove the character after the caret
                            const newValueAfter = valueAfter.slice(1);
                            return { value: valueBefore + newValueAfter, caretPosition };
                        }
                    });

                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark", "keyboard__key--caps");
                    keyElement.innerHTML = this.createIconHTML("keyboard_arrow_up");
                    
                    const handleCapsToggle = () => {
                        if (this.properties.capsState === "inactive") {
                            this.properties.capsState = "active";
                            this._toggleCapsLock();
                        } else if (this.properties.capsState === "active") {
                            this.properties.capsState = "locked";
                        } else {
                            this.properties.capsState = "inactive";
                            this._toggleCapsLock();
                        }

                        if (this.properties.capsState === "locked") {
                            keyElement.innerHTML = this.createIconHTML("keyboard_capslock");
                        } else {
                            keyElement.innerHTML = this.createIconHTML("keyboard_arrow_up");
                        }

                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsState !== "inactive");
                        keyElement.classList.toggle("keyboard__key--locked", this.properties.capsState === "locked");

                        // Update special characters dynamically
                        this._updateSpecialCharacters();
                    };

                    keyElement.addEventListener("click", handleCapsToggle);
                    keyElement.addEventListener("touchstart", handleCapsToggle);

                    break;

                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--special");
                    keyElement.innerHTML = this.createIconHTML("check_circle");

                    keyElement.addEventListener("click", () => {
                        this._handleDoneKey();
                    });

                    keyElement.addEventListener("touchstart", () => {
                        this._handleDoneKey();
                    });

                    break;

                case "spacer":
                    keyElement.style.visibility = "hidden";
                    keyElement.disabled = true;
                    break;

                case "spacer-narrow":
                    keyElement.classList.add("keyboard__key--narrow");
                    keyElement.style.visibility = "hidden";
                    keyElement.disabled = true;
                    break;

                case "spacer-wide":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.style.visibility = "hidden";
                    keyElement.disabled = true;
                    break;

                default:
                    const specialChars = ["ä", "ö", "ü"];
                    const numberChars = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "ß"];
                    const secondaryChars = {
                        "1": ".",
                        "2": ":",
                        "3": ",",
                        "4": ";",
                        "5": '"',
                        "6": "&",
                        "7": "/",
                        "8": "(",
                        "9": ")",
                        "0": "-",
                        "ß": "?"
                    };

                    keyElement.addEventListener("click", () => {
                        this._resetCapsState()
                    });

                    keyElement.addEventListener("touchend", () => {
                        this._resetCapsState()
                    });

                    if (specialChars.includes(key)) {
                        keyElement.classList.add("keyboard__key--narrow")
                    }

                    if (numberChars.includes(key)) {
                        keyElement.classList.add("keyboard__key--dark");
                    }

                    if (Object.keys(secondaryChars).includes(key)) {
                        keyElement.classList.add("keyboard__key--has-special-char");
                        keyElement.setAttribute("data-original-char", key);
                        keyElement.setAttribute("data-special-char", secondaryChars[key]);
                        keyElement.setAttribute("data-char-display-big", key);
                        keyElement.setAttribute("data-char-display-small", secondaryChars[key]);
                        keyElement.textContent = keyElement.getAttribute("data-char-display-big");

                        keyElement.addEventListener("click", () => {
                            this._resetCapsState();
                        });

                        this._addHoldBehavior(keyElement, (valueBefore, valueAfter, caretPosition) => {
                            const insertCharacter = this.properties.capsState !== "inactive" ? secondaryChars[key] : key;
                            return {
                                value: valueBefore + insertCharacter + valueAfter,
                                caretPosition: caretPosition + 1
                            };
                        });

                    } else {
                        keyElement.textContent = key.toLowerCase();

                        this._addHoldBehavior(keyElement, (valueBefore, valueAfter, caretPosition) => {
                            const insertCHaracter = this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
                            return { value: valueBefore + insertCHaracter + valueAfter, caretPosition: caretPosition + 1};
                        });
                    }
                    
                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });

        // Adjust the default behavior so that letters are lowercase by default
        this.elements.keys.forEach((key) => {
            if (key.childElementCount === 0 && !key.classList.contains("keyboard__key--has-special-char")) {
                key.textContent = key.textContent.toLowerCase();
            }
        });

        return fragment;
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
            
            if (key.classList.contains("keyboard__key--has-special-char")) {
                key.textContent = key.getAttribute("data-char-display-big")
                // const smallText = key.getAttribute("data-char-display-small");
            }
        }
    },

    _resetCapsState() {
        if (this.properties.capsState === "active") {
            this._toggleCapsLock();
            this.properties.capsState = "inactive";
            const capsKey = this.elements.keysContainer.querySelector(".keyboard__key--caps");
            if (capsKey) {
                capsKey.classList.remove("keyboard__key--active");
            }
        }

        // Update special characters dynamically
        this._updateSpecialCharacters();
    },

    _updateSpecialCharacters() {
        this.elements.keys.forEach((key) => {
            if (key.classList.contains("keyboard__key--has-special-char")) {
                if (this.properties.capsState !== "inactive") {
                    key.setAttribute("data-char-display-big", key.getAttribute("data-special-char"));
                    key.textContent = key.getAttribute("data-char-display-big");
                    key.setAttribute("data-char-display-small", key.getAttribute("data-original-char"));
                } else {
                    key.setAttribute("data-char-display-big", key.getAttribute("data-original-char"));
                    key.textContent = key.getAttribute("data-char-display-big");
                    key.setAttribute("data-char-display-small", key.getAttribute("data-special-char"));
                }
            }
        });
    },

    _addHoldBehavior(keyElement, action) {
        const startEvent = (event) => {
            event.preventDefault(); // Prevent default touch behavior
            const wrappedAction = () => {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.classList.contains("use-keyboard-input")) {
                    const valueBefore = activeElement.value.slice(0, activeElement.selectionStart);
                    const valueAfter = activeElement.value.slice(activeElement.selectionEnd); // Use selectionEnd to handle selected text
                    const result = action(valueBefore, valueAfter, activeElement.selectionStart);
                    activeElement.value = result.value;
                    activeElement.setSelectionRange(result.caretPosition, result.caretPosition);
                    this.properties.value = activeElement.value;
                    this.properties.caretPosition = result.caretPosition;
                    this._triggerEvent("oninput");
                }
            };

            wrappedAction();

            let timeout = setTimeout(() => {
                const interval = setInterval(wrappedAction, this.properties.repeatDelay);

                keyElement.addEventListener("mouseup", () => {
                    clearInterval(interval);
                }, { once: true });

                keyElement.addEventListener("mouseleave", () => {
                    clearInterval(interval);
                }, { once: true });

                keyElement.addEventListener("touchend", () => {
                    clearInterval(interval);
                }, { once: true });
            }, this.properties.repeatDelayInitial);

            keyElement.addEventListener("mouseup", () => {
                clearTimeout(timeout);
            }, { once: true });

            keyElement.addEventListener("mouseleave", () => {
                clearTimeout(timeout);
            }, { once: true });

            keyElement.addEventListener("touchend", () => {
                clearTimeout(timeout);
            }, { once: true });
        };

        keyElement.addEventListener("mousedown", startEvent);
        keyElement.addEventListener("touchstart", startEvent);
    },

    _handleDoneKey() {
        this.close();
        this._triggerEvent("onclose");

        // Deactivate the text field explicitly
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains("use-keyboard-input")) {
            activeElement.blur();
        }
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
        this.elements.main.style.zIndex = "999999";
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    },

    createIconHTML(icon_name) {
        // Creates Icon from Google Material Icon font: https://fonts.google.com/icons?hl=de%3Ficon.query%3Dkeyboard
        return `<i class="material-icons">${icon_name}</i>`;
    }
};

// Track the active input field
let activeInput = null;

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".use-keyboard-input").forEach((input) => {
        input.addEventListener("focus", () => {
            activeInput = input;
        });
    });

    // Generalize clear button logic for all inputs
    document.querySelectorAll(".use-keyboard-input").forEach((input, index) => {
        const clearButton = document.getElementById(`clear-button${index + 1}`);
        if (clearButton) {
            clearButton.addEventListener("click", () => {
                input.value = "";
            });
        }
    });

    // Initialize keyboard
    Keyboard.init();
});

document.querySelectorAll(".use-keyboard-input").forEach((input) => {
    const keyboardOffset = 10;
    input.addEventListener("focus", () => {
        // Position Eingabefeld
        const rect = input.getBoundingClientRect();

        // Höhe der Tastatur
        const keyboardElement = document.querySelector(".keyboard");
        const keyboardHeight = keyboardElement.offsetHeight + keyboardOffset;

         // Animationsdauer der Tastatur
        const animationDuration = parseFloat(
            getComputedStyle(keyboardElement).getPropertyValue("transition-duration")
        ) * 1000 || 300;

        // Resthöhe zwischen Eingabefeld und Seitenende
        const viewportHeight = window.innerHeight;
        const bottomSpace = viewportHeight - rect.bottom;

        // Abstand zwischen unterstem Content und unterem Fensterrand
        const bodyRect = document.body.getBoundingClientRect();
        const lastContentBottom = bodyRect.bottom;
        const spaceBelowContent = Math.max(viewportHeight - lastContentBottom, 0);

        // Spacer als dynamischen Leerraum einfügen, falls nötig (inkl. Höhe berechnen)        
        const extraSpaceNeeded = keyboardHeight - bottomSpace + spaceBelowContent;
        if (extraSpaceNeeded > 0) {
            const spacer = document.createElement("div");
            spacer.style.height = `${extraSpaceNeeded}px`;
            spacer.classList.add("keyboard-spacer");
            document.body.appendChild(spacer);
        }

        // Scrollen zum Eingabefeld
        const scrollY = window.scrollY + rect.bottom + keyboardHeight - viewportHeight;
        window.scrollTo({
            top: scrollY,
            behavior: "smooth"
        });

        // Spacer entfernen, wenn Eingabefeld nicht mehr ausgewählt
        input.addEventListener("blur", () => {
            const spacer = document.querySelector(".keyboard-spacer");
            if (spacer) {
                spacer.remove();
            }
        }, { once: true });
    });
});



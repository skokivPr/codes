/* Image Combiner Pro - task 2
 * Version: 1.0.1
 * Author: skoki
 * GitHub: https://github.com/skokivPr
 */

let markedDays = new Map(),
    isMultiSelecting = !1,
    multiSelectData = null,
    markMode = "single",
    isCtrlPressed = !1,
    selectedDays = new Set(),
    selectedColor = "#e74c3c",
    selectedDate = null;
const QUICK_MARKS = [
    { description: "Nocka", color: "#3498db", icon: "bi-moon-stars-fill" },
    { description: "Wolne", color: "#2ecc71", icon: "bi-house-heart-fill" },
    { description: "Urlop", color: "#e67e22", icon: "bi-airplane-fill" },
    {
        description: "\u015Awi\u0119to",
        color: "#9b59b6",
        icon: "bi-calendar-heart-fill",
    },
],
    COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"];
document.addEventListener("keydown", (a) => {
    "Control" === a.key && (isCtrlPressed = !0);
}),
    document.addEventListener("keyup", (a) => {
        if ("Control" === a.key && ((isCtrlPressed = !1), 0 < selectedDays.size)) {
            const a = selectedDays.values().next().value;
            showMarkDialog(a);
        }
    });
try {
    const a = localStorage.getItem("markedDays");
    a && (markedDays = new Map(JSON.parse(a)));
} catch (a) {
    console.error("Error loading marked days:", a);
}
function saveMarkedDays() {
    try {
        localStorage.setItem("markedDays", JSON.stringify([...markedDays])),
            updateMarkedDaysList();
    } catch (a) {
        console.error("Error saving marked days:", a);
    }
}
function kalEl(a = {}) {
    const b = (a) => a.toString().padStart(2, "0"),
        c = (c, e) => {
            const g = c.getMonth(),
                h = c.getFullYear(),
                i = new Date(h, g + 1, 0).getDate(),
                j = h === f.today.year && g === f.today.month,
                k = h === new Date().getFullYear() && g === new Date().getMonth(),
                l = d(f.info.firstDay, e)
                    .map((a) => `<div class="weekday">${a.short}</div>`)
                    .join(""),
                m = new Date(h, g, 1).getDay(),
                n = new Date(h, g + 1, 0).getDay(),
                o = 0 === m ? 6 : m - 1,
                p = 0 === n ? 0 : 7 - n,
                q = Array(o).fill('<div class="day empty"></div>').join(""),
                r = [...Array(i).keys()]
                    .map((a) => {
                        const c = new Date(h, g, a + 1);
                        let d = c.getDay();
                        0 === d && (d = 7);
                        const i = j && f.today.day === a + 1 ? " today" : "",
                            k = `${h}-${b(g + 1)}-${b(a + 1)}`,
                            l = markedDays.get(k),
                            m = l ? " marked" : "",
                            n = f.info.weekend.includes(d) ? " weekend" : "",
                            o = new Intl.DateTimeFormat(e, {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            }).format(c),
                            p = new Intl.NumberFormat(e).format(a + 1);
                        let q = "";
                        return (
                            l &&
                            (q = `style="background: ${l.color};" data-description="${l.description}"`),
                            `<div class="day${i}${m}${n}"
${q}
data-date="${k}"
aria-label="${o}">${p}</div>`
                        );
                    })
                    .join(""),
                s = Array(p).fill('<div class="day empty"></div>').join(""),
                t = new Intl.DateTimeFormat(e, { month: "long" }).format(c);
            return `<div class="month-card${void 0 === a.month ? "" : " single-month"
                }${k ? " current-month" : ""}">
<div class="month-header">${t}</div>
<div class="month-grid">
<div class="weekdays">${l}</div>
<div class="days">${q}${r}${s}</div>
</div>
</div>`;
        },
        d = (a, b) => {
            const c = new Date(0),
                d = [...Array(7).keys()].map(
                    (a) => (
                        c.setDate(5 + a),
                        {
                            long: new Intl.DateTimeFormat([b], { weekday: "long" }).format(c),
                            short:
                                "pl-PL" === b
                                    ? ["Pn", "Wt", "\u015Ar", "Cz", "Pt", "So", "Nd"][a]
                                    : new Intl.DateTimeFormat([b], { weekday: "short" }).format(
                                        c
                                    ),
                        }
                    )
                ),
                e = [...d];
            for (let c = 0; c < 8 - a; c++) e.unshift(e.pop());
            return e;
        },
        e = new Date(),
        f = {
            locale: document.documentElement.getAttribute("lang") || "en-US",
            today: { day: e.getDate(), month: e.getMonth(), year: e.getFullYear() },
            year: a.year || e.getFullYear(),
            ...a,
        },
        g = f.date ? new Date(f.date) : new Date(f.year, e.getMonth(), e.getDate());
    return (
        f.info ||
        (f.info = new Intl.Locale(f.locale).weekInfo || {
            firstDay: 7,
            weekend: [6, 7],
        }),
        void 0 === a.month
            ? f.year
                ? [...Array(12).keys()]
                    .map((a) => c(new Date(f.year, a, 1), f.locale))
                    .join("")
                : c(g, f.locale)
            : c(new Date(f.year, a.month, 1), f.locale)
    );
}
function updateMarkedDaysList() {
    const a = document.getElementById("markedDaysList"),
        b = document.getElementById("markedCount"),
        c = document.getElementById("monthFilter").value;
    a.innerHTML = "";
    const d = new Map();
    markedDays.forEach((a, b) => {
        const [c, e] = b.split("-").map((a) => parseInt(a)),
            f = `${c}-${e}`;
        d.has(f) || d.set(f, []), d.get(f).push({ dateString: b, data: a });
    });
    const e = [...d.entries()].sort((c, a) => {
        const [b, d] = c[0].split("-").map((a) => parseInt(a)),
            [e, f] = a[0].split("-").map((a) => parseInt(a));
        return e - b || f - d;
    });
    (b.textContent = `(${markedDays.size})`),
        e.forEach(([b, d]) => {
            const [e, f] = b.split("-").map((a) => parseInt(a));
            if ("all" !== c && f !== parseInt(c)) return;
            const g = new Intl.DateTimeFormat("pl-PL", { month: "long" }).format(
                new Date(e, f - 1)
            ),
                h = document.createElement("div");
            h.className = "month-group";
            const i = document.createElement("div");
            (i.className = "month-group-header"),
                (i.innerHTML = `
<span>${g} ${e}</span>
<span class="count">${d.length}</span>
`),
                i.addEventListener("click", () => {
                    (currentYear = e),
                        (currentMonth = (f - 1).toString()),
                        (monthSelect.value = currentMonth),
                        updateCalendar();
                });
            const j = document.createElement("div");
            (j.className = "month-group-content"),
                d.sort((c, a) => {
                    const [, , b] = c.dateString.split("-").map((a) => parseInt(a)),
                        [, , d] = a.dateString.split("-").map((a) => parseInt(a));
                    return d - b;
                }),
                d.forEach(({ dateString: a, data: b }) => {
                    const c = createMarkedDayItem(a, b);
                    j.appendChild(c);
                }),
                h.appendChild(i),
                h.appendChild(j),
                a.appendChild(h);
        });
}
function handleDayClick(a) {
    if (isCtrlPressed) {
        if (selectedDays.has(a)) {
            selectedDays.delete(a);
            const b = document.querySelector(`[data-date="${a}"]`);
            b && (b.style.outline = "");
        } else {
            selectedDays.add(a);
            const b = document.querySelector(`[data-date="${a}"]`);
            b &&
                ((b.style.outline = "2px solid var(--accent-color)"),
                    (b.style.outlineOffset = "-2px"));
        }
        return;
    }
    selectedDays.clear(),
        document.querySelectorAll(".day").forEach((a) => {
            (a.style.outline = ""), (a.style.outlineOffset = "");
        }),
        ((isMultiSelecting = !1),
            (multiSelectData = null),
            (selectedDate = a),
            showMarkDialog(a));
}
function createMarkedDayItem(a, b) {
    const c = document.createElement("div");
    c.className = "marked-day-item";
    const d = document.createElement("div");
    (d.className = "marked-day-color"), (d.style.backgroundColor = b.color);
    const e = document.createElement("div");
    e.className = "marked-day-info";
    const f = document.createElement("span");
    (f.className = "marked-day-date"),
        (f.innerHTML = `<i class="bi bi-calendar3"></i> ${formatDate(a)}`);
    const g = document.createElement("span");
    (g.className = "marked-day-description"),
        (g.innerHTML = `<i class="bi bi-card-text"></i> ${b.description}`),
        e.appendChild(f),
        e.appendChild(g);
    const h = document.createElement("button");
    return (
        (h.className = "marked-day-delete"),
        (h.innerHTML = '<i class="bi bi-x-lg"></i>'),
        (h.title = "Usu\u0144 zaznaczenie"),
        (h.onclick = (b) => {
            b.stopPropagation(),
                Swal.fire({
                    title: "Potwierd\u017A usuni\u0119cie",
                    text: `Czy na pewno chcesz usunąć zaznaczenie dla dnia ${formatDate(
                        a
                    )}?`,
                    icon: "warning",
                    showCancelButton: !0,
                    confirmButtonText: "Tak, usu\u0144",
                    cancelButtonText: "Anuluj",
                    confirmButtonColor: "#e74c3c",
                    cancelButtonColor: "#2b2b2b",
                }).then((b) => {
                    b.isConfirmed &&
                        (markedDays.delete(a), saveMarkedDays(), updateCalendar());
                });
        }),
        c.appendChild(d),
        c.appendChild(e),
        c.appendChild(h),
        c.addEventListener("click", () => {
            const [b, c] = a.split("-").map((a) => parseInt(a));
            (currentYear = b),
                (currentMonth = (c - 1).toString()),
                (monthSelect.value = currentMonth),
                updateCalendar();
        }),
        c
    );
}
function formatDate(a) {
    const [b, c, d] = a.split("-").map((a) => parseInt(a)),
        e = new Date(b, c - 1, d);
    return new Intl.DateTimeFormat("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(e);
}
function showMarkDialog(a) {
    const b = 0 < selectedDays.size ? Array.from(selectedDays) : [a];
    selectedDate = a;
    const c = markedDays.get(a),
        d =
            1 < selectedDays.size
                ? `Zaznaczono ${selectedDays.size} dni`
                : formatDate(a),
        e = `
<div class="quick-marks">
${QUICK_MARKS.map(
            (a) => `
<button class="quick-mark" data-description="${a.description}" data-color="${a.color}" style="--mark-color: ${a.color}">
<i class="bi ${a.icon}"></i>
${a.description}
</button>
`
        ).join("")}
</div>
<div class="color-grid" id="colorGridSwal">
${COLORS.map(
            (a) => `
<div class="color-option" style="background: ${a}" data-color="${a}"></div>
`
        ).join("")}
</div>
`;
    Swal.fire({
        title: `<i class="bi bi-calendar-plus"></i> Oznacz ${1 < selectedDays.size ? "dni" : "dzie\u0144"
            }: ${d}`,
        html: e,
        input: "text",
        inputLabel: "Opis dnia",
        inputValue: c ? c.description : "",
        inputPlaceholder: "Wprowad\u017A opis dnia...",
        showCancelButton: !0,
        cancelButtonText: '<i class="bi bi-x-lg"></i> Anuluj',
        confirmButtonText: '<i class="bi bi-check-lg"></i> Zapisz',
        confirmButtonColor: "#e74c3c",
        cancelButtonColor: "#2b2b2b",
        focusConfirm: !1,
        allowEnterKey: !0,
        allowEscapeKey: !0,
        inputValidator: (a) => {
            if (!a) return "Opis jest wymagany!";
        },
        didOpen: (a) => {
            const b = a.querySelectorAll(".quick-mark");
            b.forEach((b) => {
                b.addEventListener("click", () => {
                    const c = b.dataset.description,
                        d = b.dataset.color;
                    (selectedColor = d),
                        (Swal.getInput().value = c),
                        updateColorSelection(a),
                        "multi" === markMode && Swal.clickConfirm();
                }),
                    c &&
                    b.dataset.description === c.description &&
                    b.classList.add("active");
            });
            const d = a.querySelectorAll("#colorGridSwal .color-option");
            d.forEach((b) => {
                b.addEventListener("click", () => {
                    (selectedColor = b.dataset.color), updateColorSelection(a);
                });
            }),
                (selectedColor = c ? c.color : "#e74c3c"),
                updateColorSelection(a),
                setTimeout(() => {
                    Swal.getInput().focus();
                }, 50);
        },
    }).then((a) => {
        if (a.isConfirmed) {
            const c = a.value.trim(),
                d = { description: c, color: selectedColor };
            "multi" === markMode && (multiSelectData = d),
                b.forEach((a) => {
                    applyMarkToDay(a, d);
                }),
                selectedDays.clear(),
                document.querySelectorAll(".day").forEach((a) => {
                    (a.style.outline = ""), (a.style.outlineOffset = "");
                }),
                saveMarkedDays(),
                updateCalendar();
        }
    });
}
function applyMarkToDay(a, b) {
    b.description ? markedDays.set(a, b) : markedDays.delete(a);
}
function updateColorSelection(a = document) {
    const b = a || document;
    b.querySelectorAll(".color-option").forEach((a) => {
        a.classList.toggle("selected", a.dataset.color === selectedColor);
    }),
        b.querySelectorAll(".quick-mark").forEach((a) => {
            a.classList.toggle("active", a.dataset.color === selectedColor);
        });
}
let currentYear = new Date().getFullYear(),
    currentMonth = "all";
const app = document.getElementById("app"),
    yearDisplay = document.getElementById("currentYear"),
    lang = document.getElementById("lang"),
    monthSelect = document.getElementById("month");
(document.documentElement.lang = "pl-PL"), (lang.value = "pl-PL");
const darkModeRadio = document.getElementById("darkMode"),
    lightModeRadio = document.getElementById("lightMode"),
    savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme),
    (darkModeRadio.checked = "dark" === savedTheme),
    (lightModeRadio.checked = "light" === savedTheme),
    darkModeRadio.addEventListener("change", () => {
        document.documentElement.setAttribute("data-theme", "dark"),
            localStorage.setItem("theme", "dark");
    }),
    lightModeRadio.addEventListener("change", () => {
        document.documentElement.setAttribute("data-theme", "light"),
            localStorage.setItem("theme", "light");
    });
function updateCalendar() {
    yearDisplay.textContent = currentYear;
    const a = document.getElementById("app");
    if ("all" === currentMonth)
        a.classList.remove("single-month"),
            (app.innerHTML = kalEl({ year: currentYear }));
    else {
        a.classList.add("single-month");
        const b = parseInt(currentMonth);
        app.innerHTML = kalEl({ year: currentYear, month: b });
    }
    const b = app.querySelectorAll(".day:not(.empty)");
    b.forEach((a) => {
        a.addEventListener("click", (a) => {
            const b = a.target.dataset.date;
            handleDayClick(b);
        });
    });
    const c = app.querySelectorAll(".month-header");
    c.forEach((a) => {
        a.addEventListener("click", (a) => {
            if ("all" === currentMonth) {
                const b = a.target.closest(".month-card");
                if (b) {
                    const a = Array.from(app.children).indexOf(b);
                    (currentMonth = a.toString()),
                        (monthSelect.value = currentMonth),
                        updateCalendar();
                }
            } else
                (currentMonth = "all"), (monthSelect.value = "all"), updateCalendar();
        });
    }),
        updateMarkedDaysList();
}
monthSelect.addEventListener("change", () => {
    (currentMonth = monthSelect.value), updateCalendar();
}),
    document.getElementById("prevYear").addEventListener("click", () => {
        currentYear--, updateCalendar();
    }),
    document.getElementById("nextYear").addEventListener("click", () => {
        currentYear++, updateCalendar();
    }),
    lang.addEventListener("change", () => {
        (document.documentElement.lang = lang.value), updateCalendar();
    }),
    document.getElementById("clearMarks").addEventListener("click", () => {
        Swal.fire({
            title: "Potwierd\u017A usuni\u0119cie",
            text: "Czy na pewno chcesz usun\u0105\u0107 wszystkie zaznaczone dni? Tej operacji nie mo\u017Cna cofn\u0105\u0107.",
            icon: "warning",
            showCancelButton: !0,
            confirmButtonText: "Tak, usu\u0144 wszystko",
            cancelButtonText: "Anuluj",
            confirmButtonColor: "#e74c3c",
            cancelButtonColor: "#2b2b2b",
        }).then((a) => {
            a.isConfirmed &&
                (markedDays.clear(),
                    saveMarkedDays(),
                    updateCalendar(),
                    Swal.fire({
                        title: "Usuni\u0119to!",
                        text: "Wszystkie zaznaczenia zosta\u0142y usuni\u0119te.",
                        icon: "success",
                        confirmButtonColor: "#e74c3c",
                    }));
        });
    }),
    document
        .getElementById("monthFilter")
        .addEventListener("change", updateMarkedDaysList);
const togglePanel = document.getElementById("togglePanel"),
    sidePanel = document.getElementById("sidePanel");
let isPanelVisible = "false" !== localStorage.getItem("isPanelVisible");
function updatePanelVisibility() {
    sidePanel.classList.toggle("hidden", !isPanelVisible),
        togglePanel.classList.toggle("panel-hidden", !isPanelVisible),
        localStorage.setItem("isPanelVisible", isPanelVisible);
}
togglePanel.addEventListener("click", () => {
    (isPanelVisible = !isPanelVisible), updatePanelVisibility();
}),
    updatePanelVisibility(),
    updateCalendar();
function exportMarkedDays() {
    const b = {
        markedDays: Array.from(markedDays.entries()),
        version: "1.0",
        exportDate: new Date().toISOString(),
    },
        c = new Blob([JSON.stringify(b, null, 2)], { type: "application/json" }),
        d = URL.createObjectURL(c),
        e = document.createElement("a");
    (e.href = d),
        (e.download = `calendar-data-${new Date().toISOString().split("T")[0]
            }.json`),
        document.body.appendChild(e),
        e.click(),
        document.body.removeChild(e),
        URL.revokeObjectURL(d);
}
function importMarkedDays(a) {
    const b = new FileReader();
    (b.onload = (a) => {
        try {
            const b = JSON.parse(a.target.result);
            if (b.version && b.markedDays)
                (markedDays = new Map(b.markedDays)),
                    saveMarkedDays(),
                    updateCalendar(),
                    Swal.fire({
                        title: "Zaimportowano!",
                        text: "Dane zosta\u0142y pomy\u015Blnie zaimportowane.",
                        icon: "success",
                        confirmButtonColor: "#e74c3c",
                    });
            else throw new Error("Nieprawid\u0142owy format pliku");
        } catch (a) {
            Swal.fire({
                title: "B\u0142\u0105d importu",
                text: "Nie uda\u0142o si\u0119 zaimportowa\u0107 pliku. Upewnij si\u0119, \u017Ce plik jest w prawid\u0142owym formacie.",
                icon: "error",
                confirmButtonColor: "#e74c3c",
            });
        }
    }),
        b.readAsText(a);
}
document
    .getElementById("exportData")
    .addEventListener("click", exportMarkedDays),
    document.getElementById("importData").addEventListener("click", () => {
        const a = document.createElement("input");
        (a.type = "file"),
            (a.accept = ".json"),
            (a.onchange = (a) => {
                const b = a.target.files[0];
                b && importMarkedDays(b);
            }),
            a.click();
    });
// Function to preload images
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

// Function to get random image URL
function getRandomImageUrl() {
    const url = `https://picsum.photos/1980/1080.webp?random=${Math.random()}`;
    return `${url}&mask=circle&blur=1`;
}

// Buffer size
const BUFFER_SIZE = 3;
let imageBuffer = [];

// Fill buffer initially
async function fillBuffer() {
    while (imageBuffer.length < BUFFER_SIZE) {
        try {
            const img = await preloadImage(getRandomImageUrl());
            imageBuffer.push(img);
        } catch (error) {
            console.error("Error preloading image:", error);
        }
    }
}

function updateBackgroundImage() {
    if (imageBuffer.length > 0) {
        const img = imageBuffer.shift();
        const heroSection = document.getElementById("hero-section");

        // Create fade effect
        heroSection.style.opacity = "0";
        heroSection.style.transition = "opacity 1s ease-in-out";

        setTimeout(() => {
            heroSection.style.backgroundImage = `url(${img.src})`;
            heroSection.style.backgroundSize = "cover";
            heroSection.style.backgroundPosition = "center";
            heroSection.style.backgroundRepeat = "no-repeat";
            heroSection.style.backgroundAttachment = "fixed";
            heroSection.style.opacity = "0.61";
            heroSection.style.backgroundColor = "var(--primary-bg-rgb)";
        }, 1000);

        // Preload new image to maintain buffer
        preloadImage(getRandomImageUrl())
            .then((newImg) => imageBuffer.push(newImg))
            .catch((error) => console.error("Error preloading image:", error));
    }
}

// Initialize
fillBuffer().then(() => {
    // Change image every 10 seconds
    updateBackgroundImage();
    setInterval(updateBackgroundImage, 10000);
});

const header = document.querySelector(".header")
const menuButton = document.querySelector(".menu-toggle")
const navigation = document.querySelector(".nav")
const themeToggles = document.querySelectorAll("[data-theme-toggle]")
const mobileHeaderQuery = window.matchMedia("(max-width: 820px)")

const getStoredTheme = () => {
  try {
    return window.localStorage.getItem("neonet-theme")
  } catch {
    return null
  }
}

const setStoredTheme = theme => {
  try {
    window.localStorage.setItem("neonet-theme", theme)
  } catch {
    // Local storage can be unavailable in private or restricted browsers.
  }
}

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"

const applyTheme = theme => {
  document.documentElement.dataset.theme = theme

  const isLight = theme === "light"
  themeToggles.forEach(toggle => {
    toggle.setAttribute("aria-pressed", String(theme === "dark"))
    toggle.setAttribute(
      "aria-label",
      isLight ? "Увімкнути темну тему" : "Увімкнути світлу тему",
    )
  })
}

const initialTheme = getStoredTheme()
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: light)")

if (initialTheme === "light" || initialTheme === "dark") {
  applyTheme(initialTheme)
} else {
  applyTheme(getSystemTheme())
}

const closeMenu = () => {
  if (!menuButton || !navigation) return

  navigation.classList.remove("is-open")
  menuButton.classList.remove("is-open")
  menuButton.setAttribute("aria-expanded", "false")
  menuButton.setAttribute("aria-label", "Відкрити меню")
  document.body.classList.remove("menu-open")
}

let lastScrollY = window.scrollY
let isHeaderTicking = false
let headerScrollDistance = 0

const toggleHeaderState = () => {
  if (!header) return

  const currentScrollY = window.scrollY
  const scrollDelta = currentScrollY - lastScrollY

  header.classList.toggle("is-scrolled", currentScrollY > 12)

  if (
    !mobileHeaderQuery.matches ||
    document.body.classList.contains("menu-open")
  ) {
    header.classList.remove("is-hidden")
    headerScrollDistance = 0
    lastScrollY = currentScrollY
    return
  }

  if (Math.abs(scrollDelta) < 12) return

  if (scrollDelta > 0 && currentScrollY > 140) {
    headerScrollDistance += scrollDelta

    if (headerScrollDistance > 56) {
      header.classList.add("is-hidden")
    }
  } else if (scrollDelta < 0) {
    headerScrollDistance = 0
    header.classList.remove("is-hidden")
  }

  lastScrollY = currentScrollY
}

const requestHeaderStateUpdate = () => {
  if (isHeaderTicking) return

  isHeaderTicking = true
  window.requestAnimationFrame(() => {
    toggleHeaderState()
    isHeaderTicking = false
  })
}

toggleHeaderState()
window.addEventListener("scroll", requestHeaderStateUpdate, { passive: true })

if (themeToggles.length) {
  themeToggles.forEach(themeToggle => {
    themeToggle.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.dataset.theme || getSystemTheme()
      const nextTheme = currentTheme === "light" ? "dark" : "light"

      applyTheme(nextTheme)
      setStoredTheme(nextTheme)
    })
  })
}

systemThemeQuery.addEventListener("change", () => {
  const storedTheme = getStoredTheme()
  if (storedTheme === "light" || storedTheme === "dark") return

  applyTheme(getSystemTheme())
})

const heroSections = document.querySelectorAll(".hero, .page-hero")

if (window.matchMedia("(pointer: fine)").matches) {
  heroSections.forEach(heroSection => {
    const heroGrid = heroSection.querySelector(".hero-grid")
    if (!heroGrid) return

    heroSection.addEventListener(
      "pointermove",
      event => {
        const rect = heroGrid.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100

        heroGrid.style.setProperty("--mx", `${Math.max(0, Math.min(100, x))}%`)
        heroGrid.style.setProperty("--my", `${Math.max(0, Math.min(100, y))}%`)
      },
      { passive: true },
    )

    heroSection.addEventListener("pointerleave", () => {
      heroGrid.style.setProperty("--mx", "50%")
      heroGrid.style.setProperty("--my", "48%")
    })
  })
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open")

    menuButton.classList.toggle("is-open", isOpen)
    menuButton.setAttribute("aria-expanded", String(isOpen))
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Закрити меню" : "Відкрити меню",
    )
    document.body.classList.toggle("menu-open", isOpen)

    if (isOpen) {
      header?.classList.remove("is-hidden")
      headerScrollDistance = 0
    }
  })

  navigation.addEventListener("click", event => {
    if (event.target.closest("a")) {
      closeMenu()
    }
  })
  document.addEventListener("click", event => {
    if (!navigation.classList.contains("is-open")) return
    if (event.target.closest(".header__inner")) return

    closeMenu()
  })

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu()
    }
  })

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu()
      header?.classList.remove("is-hidden")
      headerScrollDistance = 0
    }
  })
}

mobileHeaderQuery.addEventListener("change", () => {
  header?.classList.remove("is-hidden")
  headerScrollDistance = 0
  lastScrollY = window.scrollY
})

const newsSlider = document.querySelector("[data-news-slider]")
const newsPrevButton = document.querySelector("[data-news-prev]")
const newsNextButton = document.querySelector("[data-news-next]")
const newsCueButton = document.querySelector("[data-news-cue]")
const newsSection = document.querySelector("#news")
const tariffTabButtons = document.querySelectorAll("[data-tariff-tab]")
const tariffPanels = document.querySelectorAll("[data-tariff-panel]")

const getNewsCards = () => {
  if (!newsSlider) return []
  return Array.from(newsSlider.querySelectorAll(".news-card"))
}

const getCurrentNewsIndex = () => {
  const cards = getNewsCards()
  if (!newsSlider || cards.length === 0) return 0

  const sliderCenter = newsSlider.scrollLeft + newsSlider.clientWidth / 2

  return cards.reduce((closestIndex, card, index) => {
    const currentCard = cards[closestIndex]
    const cardCenter = card.offsetLeft + card.offsetWidth / 2
    const currentCenter = currentCard.offsetLeft + currentCard.offsetWidth / 2

    return Math.abs(cardCenter - sliderCenter) <
      Math.abs(currentCenter - sliderCenter)
      ? index
      : closestIndex
  }, 0)
}

const scrollToNewsCard = index => {
  const cards = getNewsCards()
  if (!newsSlider || cards.length === 0) return

  const safeIndex = Math.max(0, Math.min(index, cards.length - 1))
  const card = cards[safeIndex]
  const left = card.offsetLeft - (newsSlider.clientWidth - card.offsetWidth) / 2

  newsSlider.scrollTo({
    left,
    behavior: "smooth",
  })

  window.setTimeout(updateNewsControls, 350)
}

const updateNewsControls = () => {
  const cards = getNewsCards()
  if (!newsSlider || !newsPrevButton || !newsNextButton || cards.length === 0)
    return

  const scrollTolerance = 4
  const maxScrollLeft = newsSlider.scrollWidth - newsSlider.clientWidth
  const hasOverflow = maxScrollLeft > scrollTolerance

  newsPrevButton.disabled =
    !hasOverflow || newsSlider.scrollLeft <= scrollTolerance
  newsNextButton.disabled =
    !hasOverflow || newsSlider.scrollLeft >= maxScrollLeft - scrollTolerance
}

if (newsSlider && newsPrevButton && newsNextButton) {
  newsPrevButton.addEventListener("click", () => {
    scrollToNewsCard(getCurrentNewsIndex() - 1)
  })

  newsNextButton.addEventListener("click", () => {
    scrollToNewsCard(getCurrentNewsIndex() + 1)
  })

  newsSlider.addEventListener("scroll", updateNewsControls, { passive: true })
  window.addEventListener("resize", updateNewsControls)
  updateNewsControls()
}

if (newsCueButton && newsSection && "IntersectionObserver" in window) {
  const newsCueObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        newsCueButton.classList.toggle("is-hidden", entry.isIntersecting)
      })
    },
    {
      rootMargin: "-18% 0px -55% 0px",
      threshold: 0.01,
    },
  )

  newsCueObserver.observe(newsSection)
}

if (tariffTabButtons.length && tariffPanels.length) {
  tariffTabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.tariffTab

      tariffTabButtons.forEach(tabButton => {
        const isActive = tabButton === button
        tabButton.classList.toggle("is-active", isActive)
        tabButton.setAttribute("aria-selected", String(isActive))
      })

      tariffPanels.forEach(panel => {
        const isActive = panel.dataset.tariffPanel === target
        panel.classList.toggle("is-active", isActive)
        panel.toggleAttribute("hidden", !isActive)
      })

      const tariffsSection = document.querySelector("#tariffs")

      tariffsSection?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      })
    })
  })
}

const revealElements = document.querySelectorAll(
  ".section-heading, .news-slider__header, .news-card, .tv-image, .tv-section__content, .about-grid, .about-feature, .support-map, .support-contact, .tariff-switcher, .tariff-panel__heading, .tariff-plan-card, .service-card, .megogo-plan-card, .promotion-card, .info-group__heading",
)
const mobileRevealQuery = window.matchMedia("(max-width: 820px)")

const prepareRevealElement = element => {
  const revealItems = Array.from(element.children).filter(
    child => !child.hidden && !child.matches("script, style"),
  )

  element.classList.add("reveal")

  revealItems.forEach((item, index) => {
    item.classList.add("reveal-item")
    item.style.setProperty("--reveal-delay", `${Math.min(index * 80, 480)}ms`)
  })
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return

        entry.target.classList.add("is-visible")
        revealObserver.unobserve(entry.target)
      })
    },
    {
      rootMargin: mobileRevealQuery.matches
        ? "0px 0px -8% 0px"
        : "0px 0px -20% 0px",
      threshold: 0.08,
    },
  )

  revealElements.forEach(prepareRevealElement)
  revealElements.forEach(element => revealObserver.observe(element))
} else {
  revealElements.forEach(element => element.classList.add("is-visible"))
}

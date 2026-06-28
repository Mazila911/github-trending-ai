import puppeteer from "puppeteer";

var BASE = "http://localhost:4321";
var passed = 0;
var failed = 0;
var results = [];

function assert(condition, name) {
  if (condition) {
    passed++;
    results.push("[PASS] " + name);
  } else {
    failed++;
    results.push("[FAIL] " + name);
  }
}

function wait(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function run() {
  var browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  var page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // ========== 1. Homepage ==========
  console.log("\n--- 1. Homepage ---");
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });

  var h1Text = await page.$eval("h1", function(el) { return el.textContent; }).catch(function() { return ""; });
  assert(h1Text.includes("发现 AI 开发者最爱的开源项目"), "Homepage h1 contains expected text");

  var searchInput = await page.$("input[placeholder*=\"搜索\"]");
  assert(searchInput !== null, "Homepage search input exists");

  var hotTagLinks = await page.$$("a[href*=\"/search?q=\"]");
  assert(hotTagLinks.length >= 6, "Homepage has at least 6 hot tags, got " + hotTagLinks.length);

  var h2Texts = await page.$$eval("h2", function(els) { return els.map(function(e) { return e.textContent; }); });
  assert(h2Texts.some(function(t) { return t.includes("今日热门"); }), "Homepage has h2 with 今日热门");
  assert(h2Texts.some(function(t) { return t.includes("精选专题"); }), "Homepage has h2 with 精选专题");

  // ========== 2. Trending page ==========
  console.log("\n--- 2. Trending page ---");
  await page.goto(BASE + "/trending", { waitUntil: "networkidle2" });

  var allItems = await page.$$(".project-item");
  var totalCount = allItems.length;
  assert(totalCount > 0, "Trending has project-item elements, got " + totalCount);

  var periodTabs = await page.$$(".period-tab");
  assert(periodTabs.length === 3, "Trending has 3 period-tab buttons, got " + periodTabs.length);

  // Language filter
  await page.select("#language-select", "Python");
  await wait(500);
  var visibleAfterLang = await page.$$eval(".project-item", function(els) {
    return els.filter(function(el) { return el.style.display !== "none"; }).length;
  });
  assert(visibleAfterLang < totalCount, "Language filter reduces items: " + visibleAfterLang + " < " + totalCount);

  // Sort works
  await page.select("#language-select", "");
  await wait(300);
  await page.select("#sort-select", "stars");
  await wait(500);
  var starsValues = await page.$$eval(".project-item", function(els) {
    return els.filter(function(el) { return el.style.display !== "none"; }).slice(0, 3).map(function(el) {
      return parseInt(el.getAttribute("data-stars") || "0", 10);
    });
  });
  var sortOk = starsValues.length >= 3 && starsValues[0] >= starsValues[1] && starsValues[1] >= starsValues[2];
  assert(sortOk, "Sort by stars descending: " + starsValues.join(", "));

  // Period tab click
  var weeklyTab = await page.$(".period-tab[data-period=\"weekly\"]");
  if (weeklyTab) {
    await weeklyTab.click();
    await wait(300);
    var weeklyClass = await page.$eval(".period-tab[data-period=\"weekly\"]", function(el) { return el.className; });
    assert(weeklyClass.includes("text-white"), "Weekly tab has text-white class");
  } else {
    assert(false, "Weekly period tab not found");
  }

  // ========== 3. Project detail page ==========
  console.log("\n--- 3. Project detail page ---");
  await page.goto(BASE + "/trending", { waitUntil: "networkidle2" });
  var detailHref = await page.$eval(".project-item a[href*=\"/repo/\"]", function(el) {
    return el.getAttribute("href");
  }).catch(function() { return null; });

  if (detailHref) {
    var detailUrl = detailHref.startsWith("http") ? detailHref : BASE + detailHref;
    await page.goto(detailUrl, { waitUntil: "networkidle2" });
    var detailTitle = await page.title();
    assert(!detailTitle.includes("404"), "Project detail page title not 404: " + detailTitle);
    var imgs = await page.$$("img");
    assert(imgs.length > 0, "Project detail page has img elements");
  } else {
    assert(false, "No project detail link found");
    assert(false, "Project detail page has img elements (skipped)");
  }

  // ========== 4. Collections page ==========
  console.log("\n--- 4. Collections page ---");
  await page.goto(BASE + "/collections", { waitUntil: "networkidle2" });

  var collectionLinks = await page.$$("a[href*=\"/collection/\"]");
  assert(collectionLinks.length > 0, "Collections page has collection links, got " + collectionLinks.length);

  if (collectionLinks.length > 0) {
    var collHref = await page.$eval("a[href*=\"/collection/\"]", function(el) { return el.getAttribute("href"); });
    var collUrl = collHref.startsWith("http") ? collHref : BASE + collHref;
    await page.goto(collUrl, { waitUntil: "networkidle2" });
    var collTitle = await page.title();
    assert(!collTitle.includes("404"), "Collection detail page title not 404: " + collTitle);
  } else {
    assert(false, "Collection detail page (skipped)");
  }

  // ========== 5. Search page ==========
  console.log("\n--- 5. Search page ---");
  await page.goto(BASE + "/search", { waitUntil: "networkidle2" });

  var searchPageInput = await page.$("#search-input");
  assert(searchPageInput !== null, "Search page has #search-input");

  if (searchPageInput) {
    await page.type("#search-input", "python");
    await wait(2000);
    var searchResultsLen = await page.$eval("#search-results", function(el) { return el.innerHTML.length; }).catch(function() { return 0; });
    assert(searchResultsLen > 10, "Search python results innerHTML length > 10, got " + searchResultsLen);
  } else {
    assert(false, "Search python results (skipped)");
  }

  await page.goto(BASE + "/search?q=rust", { waitUntil: "networkidle2" });
  await wait(2000);
  var rustResultsLen = await page.$eval("#search-results", function(el) { return el.innerHTML.length; }).catch(function() { return 0; });
  assert(rustResultsLen > 10, "Search rust via URL results innerHTML length > 10, got " + rustResultsLen);

  // ========== 6. Theme toggle ==========
  console.log("\n--- 6. Theme toggle ---");
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });

  var themeToggle = await page.$("#theme-toggle");
  if (themeToggle) {
    await themeToggle.click();
    await wait(300);
    var themeAfterClick = await page.$eval("html", function(el) { return el.getAttribute("data-theme"); });
    assert(themeAfterClick === "light", "Theme toggle sets data-theme=light, got " + themeAfterClick);

    await themeToggle.click();
    await wait(300);
    var themeAfterSecond = await page.$eval("html", function(el) { return el.getAttribute("data-theme"); });
    assert(themeAfterSecond === null || themeAfterSecond !== "light", "Theme toggle again removes light, got " + themeAfterSecond);
  } else {
    assert(false, "Theme toggle #theme-toggle not found");
    assert(false, "Theme toggle second click (skipped)");
  }

  // ========== 7. Responsive ==========
  console.log("\n--- 7. Responsive ---");
  await page.setViewport({ width: 375, height: 667 });
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });

  var mobileMenuToggle = await page.$("#mobile-menu-toggle");
  assert(mobileMenuToggle !== null, "Responsive: #mobile-menu-toggle exists at 375px");

  // ========== 8. Navigation ==========
  console.log("\n--- 8. Navigation ---");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });

  var navHrefs = await page.$$eval("header a[href]", function(els) {
    return els.map(function(el) { return el.getAttribute("href"); });
  });
  assert(navHrefs.some(function(h) { return h.includes("/trending"); }), "Nav has /trending link");
  assert(navHrefs.some(function(h) { return h.includes("/collections"); }), "Nav has /collections link");
  assert(navHrefs.some(function(h) { return h.includes("/projects"); }), "Nav has /projects link");

  await browser.close();

  // Summary
  console.log("\n========== E2E Test Results ==========");
  for (var i = 0; i < results.length; i++) {
    console.log(results[i]);
  }
  console.log("======================================");
  console.log("Total: " + (passed + failed) + " | Passed: " + passed + " | Failed: " + failed);
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(function(err) {
  console.error("E2E test error:", err);
  process.exit(1);
});

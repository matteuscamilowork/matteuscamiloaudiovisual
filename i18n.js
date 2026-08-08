/* Matteus Camilo — Internationalization loader (PT / EN / ES) */
(function(){
    "use strict";

    var STORE = "mc-lang";

    function detect(){
        var s = null;
        try{ s = localStorage.getItem(STORE); }catch(e){}
        if(s === "pt" || s === "en" || s === "es") return s;
        var nav = "";
        try{ nav = (navigator.language || (navigator.languages && navigator.languages[0]) || "").toLowerCase(); }catch(e){}
        if(nav.indexOf("es") === 0) return "es";
        return nav.indexOf("en") === 0 ? "en" : "pt";
    }

    var lang = detect();
    var dicts = window.TRANSLATIONS || { pt:{}, en:{} };

    function t(key, vars){
        var s = dicts[lang] && dicts[lang][key];
        if(s === undefined) s = dicts.pt && dicts.pt[key];
        if(s === undefined) return key;
        if(vars){
            for(var k in vars){
                s = s.split("{" + k + "}").join(String(vars[k]));
            }
        }
        return s;
    }

    function getVal(key){
        var s = dicts[lang] && dicts[lang][key];
        if(s === undefined) s = dicts.pt && dicts.pt[key];
        return s;
    }

    function pageName(){
        var p = location.pathname.split("/").pop();
        return p || "index.html";
    }

    function setMeta(kind, name, val){
        document.querySelectorAll("meta[" + kind + '="' + name + '"]').forEach(function(el){
            el.setAttribute("content", val);
        });
    }

    function applySEO(){
        var page = pageName();
        var seo = (window.SEO || {})[page];
        if(!seo || !seo[lang]) return;
        var m = seo[lang];
        document.title = m.title;
        setMeta("name", "description", m.desc);
        setMeta("property", "og:title", m.ogTitle);
        setMeta("property", "og:description", m.ogDesc);
        setMeta("name", "twitter:title", m.twTitle);
        setMeta("name", "twitter:description", m.twDesc);
        document.documentElement.setAttribute("lang", lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en");
        var locale = lang === "pt" ? "pt_BR" : lang === "es" ? "es_ES" : "en_US";
        setMeta("property", "og:locale", locale);
    }

    function applyTranslations(){
        document.querySelectorAll("[data-i18n]").forEach(function(el){
            if(el.tagName === "TITLE") return;
            var val = getVal(el.getAttribute("data-i18n"));
            if(val !== undefined) el.innerHTML = val;
        });
        document.querySelectorAll("[data-i18n-attr]").forEach(function(el){
            var spec = el.getAttribute("data-i18n-attr");
            var parts = spec.split("|");
            var attr = parts[0], key = parts[1];
            var val = getVal(key);
            if(val !== undefined) el.setAttribute(attr, val);
        });
    }

    function applyTextMap(){
        var map = window.TEXT_MAP || {};
        document.querySelectorAll(".yt-card h4, .portfolio-tags span, .service-tags span").forEach(function(el){
            var txt = (el.textContent || "").trim();
            for(var k in map){
                var m = map[k];
                if(m && (m.pt === txt || m.en === txt || m.es === txt)){
                    el.textContent = m[lang] || m.pt;
                    return;
                }
            }
        });
        document.querySelectorAll("[data-i18n-value]").forEach(function(el){
            var attr = el.getAttribute("data-i18n-value");
            var cur = el.getAttribute(attr);
            if(!cur) return;
            for(var k in map){
                if(map[k] && (map[k].pt === cur || map[k].en === cur || map[k].es === cur)){
                    el.setAttribute(attr, map[k][lang]);
                    return;
                }
            }
        });
    }

    function refreshA11y(){
        document.querySelectorAll(".yt-track-wrap[role=region]").forEach(function(wrap){
            var total = wrap.querySelectorAll(".yt-card").length;
            wrap.setAttribute("aria-label", t("a11y.carousel", { total: total }));
        });
        document.querySelectorAll(".yt-dot").forEach(function(dot, i){
            var carousel = dot.closest(".yt-carousel");
            var total = carousel ? carousel.querySelectorAll(".yt-dot").length : 0;
            dot.setAttribute("aria-label", t("a11y.goTo", { n: i + 1, total: total }));
        });
        document.querySelectorAll(".depo-dot").forEach(function(dot, i){
            dot.setAttribute("aria-label", t("a11y.depo", { n: i + 1 }));
        });
    }

    var heroAnimated = false;

    function wrapHero(){
        var desc = document.getElementById("heroDesc");
        if(!desc) return;
        var html = desc.innerHTML;
        var tmp = document.createElement("div");
        tmp.innerHTML = html;
        var wrapped = "";
        Array.from(tmp.childNodes).forEach(function(n){
            if(n.nodeType === 3){
                n.textContent.split(/(\s+)/).forEach(function(w){
                    if(w.trim()) wrapped += "<span class=\"word\">" + w + "</span>";
                    else wrapped += w;
                });
            }else if(n.nodeType === 1){
                wrapped += "<" + n.tagName.toLowerCase() + " class=\"" + n.className + "\">" + n.innerHTML + "</" + n.tagName.toLowerCase() + ">";
            }
        });
        desc.innerHTML = wrapped;
        desc.style.opacity = "1";
        var words = desc.querySelectorAll(".word");
        if(heroAnimated){
            words.forEach(function(w){ w.classList.add("visible"); });
            return;
        }
        heroAnimated = true;
        words.forEach(function(w, i){
            setTimeout(function(){ w.classList.add("visible"); }, 150 + i * 45);
        });
    }

    function applyAll(){
        applyTranslations();
        applySEO();
        applyTextMap();
        refreshA11y();
        wrapHero();
    }

    function renderSwitch(){
        document.querySelectorAll(".lang-btn").forEach(function(btn){
            var l = btn.getAttribute("data-lang");
            var isActive = l === lang;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    }

    function setLang(l, persist){
        if(l !== "pt" && l !== "en" && l !== "es") return;
        lang = l;
        if(persist){
            try{ localStorage.setItem(STORE, l); }catch(e){}
        }
        renderSwitch();
        applyAll();
        document.dispatchEvent(new CustomEvent("i18n:changed", { detail: { lang: lang } }));
    }

    document.addEventListener("DOMContentLoaded", function(){
        renderSwitch();
        applyAll();
        document.dispatchEvent(new CustomEvent("i18n:ready", { detail: { lang: lang } }));
        document.addEventListener("click", function(e){
            var btn = e.target.closest ? e.target.closest(".lang-btn") : null;
            if(btn) setLang(btn.getAttribute("data-lang"), true);
        });
    });

    window.t = t;
    window.tLang = function(){ return lang; };
    window.I18N = {
        get lang(){ return lang; },
        setLang: setLang,
        t: t
    };
})();

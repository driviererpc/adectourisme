/* Portail Métiers & Formations du Tourisme à La Réunion — logique commune */

(function () {
  "use strict";

  /* ---------- Navigation mobile ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /* ---------- Chargement des données ---------- */
  function loadJSON(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error("Impossible de charger " + path);
      return res.json();
    });
  }

  var CATEGORIES_METIERS = {
    hebergement: "Hébergement & hôtellerie",
    restauration: "Restauration",
    activites: "Activités & loisirs nature",
    agences: "Agences de voyage & réceptif",
    transport: "Transport touristique",
    evenementiel: "Événementiel & animation",
    gestion: "Gestion, marketing & développement"
  };

  var NIVEAUX_FORMATIONS = {
    cap: "CAP",
    "mention-complementaire": "Mention complémentaire",
    "bac-pro": "Bac Professionnel",
    "titre-professionnel": "Titre professionnel",
    bts: "BTS",
    "licence-pro": "Licence professionnelle",
    master: "Master",
    bpjeps: "BPJEPS (Diplôme d'État)",
    "formation-continue": "Formation continue courte"
  };

  var DOMAINES_FORMATIONS = {
    restauration: "Restauration",
    hebergement: "Hébergement",
    "hebergement-restauration": "Hébergement & restauration",
    "agences-gestion": "Agences, gestion & développement",
    "activites-nature": "Activités de pleine nature",
    "evenementiel-animation": "Événementiel & animation",
    transversal: "Transversal / multi-secteurs"
  };

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  /* ================= PAGE MÉTIERS ================= */
  function initMetiersPage() {
    var grid = document.getElementById("metiers-grid");
    if (!grid) return;

    var searchInput = document.getElementById("metiers-search");
    var categorySelect = document.getElementById("metiers-categorie");
    var countEl = document.getElementById("metiers-count");
    var emptyEl = document.getElementById("metiers-empty");

    loadJSON("data/metiers.json")
      .then(function (metiers) {
        function render() {
          var query = (searchInput.value || "").toLowerCase().trim();
          var cat = categorySelect.value;

          var filtered = metiers.filter(function (m) {
            var matchesCat = !cat || m.categorie === cat;
            var matchesQuery =
              !query ||
              m.titre.toLowerCase().indexOf(query) !== -1 ||
              m.resume.toLowerCase().indexOf(query) !== -1;
            return matchesCat && matchesQuery;
          });

          countEl.textContent =
            filtered.length + (filtered.length === 1 ? " métier trouvé" : " métiers trouvés");
          emptyEl.style.display = filtered.length ? "none" : "block";

          grid.innerHTML = filtered
            .map(function (m) {
              return (
                '<div class="card">' +
                '<span class="tag">' + escapeHTML(CATEGORIES_METIERS[m.categorie] || m.categorie) + "</span>" +
                "<h3>" + escapeHTML(m.titre) + "</h3>" +
                "<p>" + escapeHTML(m.resume) + "</p>" +
                '<a href="#" class="card-link" data-metier-id="' + escapeHTML(m.id) + '">Voir la fiche métier →</a>' +
                "</div>"
              );
            })
            .join("");
        }

        searchInput.addEventListener("input", render);
        categorySelect.addEventListener("change", render);
        render();

        grid.addEventListener("click", function (e) {
          var link = e.target.closest("[data-metier-id]");
          if (!link) return;
          e.preventDefault();
          var metier = metiers.find(function (m) {
            return m.id === link.getAttribute("data-metier-id");
          });
          if (metier) openMetierModal(metier);
        });
      })
      .catch(function (err) {
        grid.innerHTML = '<p class="empty-state">Erreur de chargement des données : ' + escapeHTML(err.message) + "</p>";
      });
  }

  function openMetierModal(metier) {
    var overlay = document.getElementById("modal-overlay");
    var body = document.getElementById("modal-body");
    if (!overlay || !body) return;

    var competences = (metier.competences || [])
      .map(function (c) {
        return "<li>" + escapeHTML(c) + "</li>";
      })
      .join("");

    body.innerHTML =
      '<span class="tag">' + escapeHTML(CATEGORIES_METIERS[metier.categorie] || metier.categorie) + "</span>" +
      "<h2>" + escapeHTML(metier.titre) + "</h2>" +
      "<p>" + escapeHTML(metier.description) + "</p>" +
      "<h3>Compétences clés</h3>" +
      '<ul class="chip-list">' + competences + "</ul>" +
      '<ul class="detail-list">' +
      "<li><strong>Environnement :</strong> " + escapeHTML(metier.environnement) + "</li>" +
      "<li><strong>Évolutions possibles :</strong> " + escapeHTML(metier.debouches) + "</li>" +
      "</ul>" +
      '<p style="margin-top:18px;"><a class="btn btn-primary" href="formations.html?metierId=' +
      encodeURIComponent(metier.id) +
      '">Voir les formations liées</a></p>';

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function initModal() {
    var overlay = document.getElementById("modal-overlay");
    if (!overlay) return;
    var closeBtn = overlay.querySelector(".modal-close");

    function close() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ================= PAGE FORMATIONS ================= */
  function initFormationsPage() {
    var grid = document.getElementById("formations-grid");
    if (!grid) return;

    var searchInput = document.getElementById("formations-search");
    var niveauSelect = document.getElementById("formations-niveau");
    var domaineSelect = document.getElementById("formations-domaine");
    var countEl = document.getElementById("formations-count");
    var emptyEl = document.getElementById("formations-empty");

    var params = new URLSearchParams(window.location.search);
    var metierIdFilter = params.get("metierId");

    Promise.all([loadJSON("data/formations.json"), loadJSON("data/metiers.json")]).then(function (results) {
      var formations = results[0];
      var metiers = results[1];
      var relatedMetier = metierIdFilter
        ? metiers.find(function (m) {
            return m.id === metierIdFilter;
          })
        : null;

      var noticeEl = document.getElementById("formations-notice");
      if (relatedMetier && noticeEl) {
        noticeEl.style.display = "block";
        noticeEl.innerHTML =
          "Formations liées au métier <strong>" +
          escapeHTML(relatedMetier.titre) +
          '</strong>. <a href="formations.html">Réinitialiser le filtre</a>';
      }

      var allowedIds = relatedMetier ? relatedMetier.formationsLiees || [] : null;

      function render() {
        var query = (searchInput.value || "").toLowerCase().trim();
        var niveau = niveauSelect.value;
        var domaine = domaineSelect.value;

        var filtered = formations.filter(function (f) {
          var matchesNiveau = !niveau || f.niveau === niveau;
          var matchesDomaine = !domaine || f.domaine === domaine;
          var matchesQuery = !query || f.titre.toLowerCase().indexOf(query) !== -1;
          var matchesMetier = !allowedIds || allowedIds.indexOf(f.id) !== -1;
          return matchesNiveau && matchesDomaine && matchesQuery && matchesMetier;
        });

        countEl.textContent =
          filtered.length + (filtered.length === 1 ? " formation trouvée" : " formations trouvées");
        emptyEl.style.display = filtered.length ? "none" : "block";

        grid.innerHTML = filtered
          .map(function (f) {
            return (
              '<div class="card">' +
              '<span class="tag tag-accent">' + escapeHTML(NIVEAUX_FORMATIONS[f.niveau] || f.niveau) + "</span>" +
              "<h3>" + escapeHTML(f.titre) + "</h3>" +
              "<p>" + escapeHTML(f.description) + "</p>" +
              '<ul class="detail-list">' +
              "<li><strong>Durée :</strong> " + escapeHTML(f.duree) + "</li>" +
              "<li><strong>Modalité :</strong> " + escapeHTML(f.modalite) + "</li>" +
              "<li><strong>Domaine :</strong> " + escapeHTML(DOMAINES_FORMATIONS[f.domaine] || f.domaine) + "</li>" +
              "</ul>" +
              "</div>"
            );
          })
          .join("");
      }

      searchInput.addEventListener("input", render);
      niveauSelect.addEventListener("change", render);
      domaineSelect.addEventListener("change", render);
      render();
    }).catch(function (err) {
      grid.innerHTML = '<p class="empty-state">Erreur de chargement des données : ' + escapeHTML(err.message) + "</p>";
    });
  }

  /* ================= PAGE ACCUEIL — métiers en vedette ================= */
  function initHomeHighlights() {
    var grid = document.getElementById("home-metiers-grid");
    if (!grid) return;

    var featuredIds = [
      "guide-moyenne-montagne",
      "cuisinier",
      "conseiller-voyages",
      "charge-developpement-touristique"
    ];

    loadJSON("data/metiers.json")
      .then(function (metiers) {
        var featured = featuredIds
          .map(function (id) {
            return metiers.find(function (m) {
              return m.id === id;
            });
          })
          .filter(Boolean);

        grid.innerHTML = featured
          .map(function (m) {
            return (
              '<div class="card">' +
              '<span class="tag">' + escapeHTML(CATEGORIES_METIERS[m.categorie] || m.categorie) + "</span>" +
              "<h3>" + escapeHTML(m.titre) + "</h3>" +
              "<p>" + escapeHTML(m.resume) + "</p>" +
              '<a class="card-link" href="metiers.html">Voir la fiche métier →</a>' +
              "</div>"
            );
          })
          .join("");
      })
      .catch(function () {
        grid.innerHTML = "";
      });
  }

  /* ================= FORMULAIRE CONTACT (démonstration) ================= */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var confirmation = document.getElementById("contact-confirmation");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.style.display = "none";
      if (confirmation) confirmation.style.display = "block";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initModal();
    initMetiersPage();
    initFormationsPage();
    initHomeHighlights();
    initContactForm();
  });
})();

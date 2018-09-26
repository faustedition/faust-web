/* The concordance table and the tables on the archive pages work basically in the same way. Differences:
 *
 * (1) The concordance table contains a repository column that is unneeded for the others
 * (2) Each archive detail page contains only the documents from that archive
 */

define(['faust_common', 'sortable', 'data/document_metadata', 'data/concordance_columns', 'data/archives'],
  function(Faust, Sortable, documentMetadata, concordanceColumns, archives) {

    return function createConcordanceTable(container, repository) {

      // run sigil-labels-json.xsl on sigil-labels.xml (faust-gen-html) to get this list:
      var sigilLabels = {
        "idno_faustedition": "Faustedition",
        "idno_wa_faust": "WA, Faust",
        "idno_bohnenkamp": "Bohnenkamp",
        "idno_fischer_lamberg": "Fischer-Lamberg",
        "idno_landeck": "Landeck",
        "idno_fa": "FA",
        "idno_ma": "MA",
        "idno_wa_gedichte": "WA, Gedichte",
        "idno_wa_div": "WA, Divan",
        "idno_hagen": "Hagen",
        "idno_wa_I_53": "WA I 53",
        "idno_hagen_nr": "Hagen-Nr.",
        "idno_aa_ls_helenaank": "AA Ls, Helena-Ankündigung",
        "idno_wa_helenaank": "WA, Helena-Ankündigung",
        "idno_aa_wilhelmmeister": "AA, Wilhelm Meister",
        "idno_wa_mur": "WA, Maximen und Reflexionen",
        "idno_gsa_1": "GSA",
        "idno_gsa_2": "GSA",
        "idno_fdh_frankfurt": "FRA",
        "idno_dla_marbach": "MAR",
        "idno_sb_berlin": "BER",
        "idno_ub_leipzig": "LEI",
        "idno_ub_bonn": "BON",
        "idno_veste_coburg": "COB",
        "idno_gm_duesseldorf": "DUE",
        "idno_sa_hannover": "HAN",
        "idno_thlma_weimar": "WEI",
        "idno_bb_cologny": "COL",
        "idno_ub_basel": "BAS",
        "idno_bj_krakow": "KRA",
        "idno_agad_warszawa": "WAR",
        "idno_bb_vicenza": "VIC",
        "idno_bl_oxford": "OXF",
        "idno_bl_london": "LON",
        "idno_ul_edinburgh": "EDI",
        "idno_ul_yale": "YAL",
        "idno_tml_new_york": "NY",
        "idno_ul_pennstate": "PEN"
      };



      // remove test and the texts from the other repositories
      documentMetadata.metadata = documentMetadata.metadata.filter(function(metadata) {
        return metadata.text !== "test.xml" &&
          (!repository || metadata.sigils.repository === repository)
      });

      // if we're in single repository mode, we can remove the location and (except
      // for gsa) the second archive signature column
      if (repository) {
        concordanceColumns = concordanceColumns.filter(function(column) {
          return !(column.sigils[0] === 'repository'
            || repository !== 'gsa' && column.sigils[0] === 'idno_gsa_1');
        });
      }


      // Map document metadata into format for table
      // This creates a two-dimensonal (docs × columns) array of cellData objects. Each cellData object features
      // * .text – the (plain) text to use for sort & in most cases display
      // * .key=value – the
      // * .sigils = { idno, value }
      var concordanceTableData = documentMetadata.metadata.map(function(metadata) {
        var columnNo, sigilNo;
        var tableElementData = [];
        // for each element in document metadata iterate through all concordance columns and write data
        // from metadata if it is part of one of the concordance colimns
        for(columnNo = 0; columnNo < concordanceColumns.length; columnNo++) {
          var tableElementColumnData = {
            text: "",
            sigils: []
          };

          // marker to find out if the current concordance column field contains more than one sigil.
          // iterate through each sigil that will make up the data for the current concordance column
          for(sigilNo = 0; sigilNo < concordanceColumns[columnNo].sigils.length; sigilNo++) {
            var sigil_key = concordanceColumns[columnNo].sigils[sigilNo],
              sigil = metadata.sigils[sigil_key];
            // current sigil found in document's metadata
            if(sigil) {
              // Now write the actual sigil value from document metadata to concordance table. If the current column is
              // "repository", than replace the sigil with it's textual representation (archive displayName)
              if(sigil_key === "repository" && archives[metadata.sigils[concordanceColumns[columnNo].sigils[sigilNo]]]) {
                tableElementColumnData.text = tableElementColumnData.text + archives[sigil].displayName;
                tableElementColumnData["displayName"] = archives[sigil].displayName;
              } else {
                // if the sigil isn't "repository" write it to the result string for the current column.
                // if the value of the current sigil equals "none" or "n.s." than mute the output. otherwise write sigil.
                if( ( sigil !== "none" ) && ( sigil !== "n.s." ) ) {
                  // next condition: sigil idno_gsa_1 may only be written, if the attached repository is gsa. otherwise mute output of idno_gsa_1 sigil
                  if( !( (sigil_key === "idno_gsa_1") && !(metadata.sigils["repository"] === "gsa") ) ) {
                    if (concordanceColumns[columnNo].sigils.length > 1) {
                      tableElementColumnData.sigils.push({key: sigil_key, value: sigil});
                    }
                    // only retain the first valid sigil in the `text` attribute to be used for sorting
                    if (tableElementColumnData.text === "")
                      tableElementColumnData.text = sigil;
                  }
                }
              }
              tableElementColumnData[concordanceColumns[columnNo].sigils[sigilNo]] = metadata.sigils[concordanceColumns[columnNo].sigils[sigilNo]];
            }
          }
          tableElementData.push(tableElementColumnData);
        };

        // store faustUri for adding link to table row later on:
        tableElementData.sigil = metadata.sigil;
        tableElementData.isPrint = metadata.type === "print";

        return tableElementData;
      });

      var HERMAPHRODITE = "1_H.1"; // print + manuscript
      concordanceData = concordanceTableData.filter(function(tableData) {return !tableData.isPrint || tableData.sigil == HERMAPHRODITE});
      // concordancePrintTableData = concordanceTableData.filter(function(tableData) {return tableData.isPrint;});

      var concordanceTableContainer = container;

      // create function for table generation
      // return function createConcordanceTable(concordanceColumns, concordanceData) {
      var span;
      var i, j;

      var concordanceTable = document.createElement("table");
      concordanceTable.id = "concordanceTable";
      concordanceTable.className = "pure-table";
      concordanceTable.dataset.sortable = true;

      var tableHead = document.createElement("thead");
      var tableRow = document.createElement("tr");

      // create table header row
      for(i = 0; i < concordanceColumns.length; i++) {
        var th = document.createElement("th");

        th.appendChild(document.createTextNode(concordanceColumns[i].column));
        if (i === 0) {
          th.dataset.sorted = true;
          th.dataset.sortedDirection = "ascending";
        } else {
          th.dataset.sorted = false;
        }
        if (concordanceColumns[i].tooltip)
          th.setAttribute('title', concordanceColumns[i].tooltip);
        if (concordanceColumns[i].type)
          th.dataset.sortableType = concordanceColumns[i].type;

        tableRow.appendChild(th);
      }
      tableHead.appendChild(tableRow);
      concordanceTable.appendChild(tableHead);

      var tableBody = document.createElement("tbody");

      // create rows for each column
      concordanceData.forEach(function(currentDocument, documentIndex) {
        tableRow = document.createElement("tr");
        var documentLink = "document?sigil=" + currentDocument.sigil;
        tableRow.addEventListener("click", function(event) {
          if (event.target.nodeName.toUpperCase() === "A"
            && event.target.href)
            window.location = event.target.href;
          else
            window.location = documentLink;
        });

        concordanceColumns.forEach(function(currentColumn, columnIndex) {
          tableData = document.createElement("td");
          var cellData = concordanceData[documentIndex][columnIndex];
          // First column: faustedition sigil, explicit link
          if (columnIndex == 0) {
            var tableDataLink = document.createElement("a");
            tableDataLink.href = documentLink;
            tableDataLink.classList.add('pure-nowrap');
            tableDataLink.appendChild(document.createTextNode(cellData.text));
            tableData.appendChild(tableDataLink);
            // repo column: Explicit link to repo page
          } else if ('repository' in cellData) {
            var repoLink = document.createElement("a");
            repoLink.href = 'archive_locations_detail?id=' + cellData['repository'];
            repoLink.appendChild(document.createTextNode(cellData.text));
            tableData.appendChild(repoLink);
            // sigils in cells that can come from more than one sigil always get tooltips etc.
          } else if (cellData.sigils.length > 0) {
            tableData.setAttribute('data-sort', cellData.text);
            cellData.sigils.forEach(function(sigilData, sigilIndex, sigils) {
              var elem = document.createElement('span');
              elem.classList.add('sigil');
              elem.classList.add('pure-nowrap');
              var tooltip;
              if (sigilLabels[sigilData.key])
                tooltip = sigilLabels[sigilData.key];
              else
                tooltip = sigilData.key;
              elem.setAttribute('title', tooltip);
              elem.textContent = sigilData.value;
              tableData.appendChild(elem);
              if (sigilIndex + 1 < sigils.length) {
                tableData.appendChild(document.createTextNode('; '));
              }
            });
            // everything else: Just put the text in
          } else {
            tableData.appendChild(document.createTextNode(cellData.text));
          }
          tableRow.appendChild(tableData);
        });
        tableBody.appendChild(tableRow);
      });
      concordanceTable.appendChild(tableBody);

      container.appendChild(concordanceTable);
      Sortable.initTable(concordanceTable);

      return concordanceTable;
      //};
    }
  });

const MLA_SEARCH = "https://api.mercadolibre.com/sites/MLA/search?q="
const MLA_SEARCH_LIMIT = 1000;

function search_mla_items(searchQuery, callback, maxResults, offset, results) {
  if (!offset) offset = 0;
  if (!results) results = [];

  $.ajax(MLA_SEARCH + searchQuery + "&offset=" + offset, {
    success: function(response) {
      results = results.concat(response.results);

      let limit = response.paging.limit;
      let totalResults = response.paging.total;
      let currentResults = Math.min(totalResults, limit);

      if (currentResults < totalResults && offset < MLA_SEARCH_LIMIT && offset + limit < maxResults) {
        search_mla_items(searchQuery, callback, maxResults, offset + limit, results);
      } else {
        callback(results);
      }
    }
  });
}
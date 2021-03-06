let currentId = 0;

// Create query components
$.get("js/components/query.js");
$.get("js/components/result.js");

let vue = new Vue({
  el: '#app',
  data: {
    ui_searchQuery: null,
    ui_filteringQuery: { title: "Error", results: [] },
    queries: [],
    max_results: 300
  },
  computed: {
    matching_sellers: () => {
      let matches = [];
      let sellers = [];
      let queries = vue.queries;
      
      // First, take the sellers from the first query, and 
      // only leave the sellers that appear in all other queries.
      if (queries.length == 0) return 0;
      else matches = vue.get_sellers(queries[0]);
      
      for (let queryIdx in queries) {
        let query = queries[queryIdx];
        let sellers = vue.get_sellers(query);

        matches = matches.filter(e => sellers.includes(e));
      }

      // Then, create a seller object for all the matches.
      for (let matchIdx in matches) {
        let seller = {
          id: matches[matchIdx],
          find_result: function(query) {
            let results = vue.sort_results_byPrice(query);

            return results.filter(e => e.seller_id == this.id)[0];
          },
          find_totalPrice: function() {
            let sum = 0;

            for (let queryIdx in queries) {
              let query = queries[queryIdx];
              let results = vue.sort_results_byPrice(query);
              results = results.filter(e => e.seller_id == this.id)

              sum += results[0].price;
            }

            return sum;
          }
        }

        sellers.push(seller);
      }

      return sellers.sort((a, b) => a.find_totalPrice() - b.find_totalPrice());
    }
  },
  methods: {
    ui_search: function(searchQuery) {
      let query = { 
        id: currentId++,
        title: searchQuery,
        loaded: false,
        results: [],
        thumbnail: null,
        min_price: 0
      };

      this.queries.push(query);

      search_mla_items(searchQuery, (results) => {
        for (var i in results) {
          let result = {
            id: results[i].id,
            title: results[i].title,
            price: Math.ceil(results[i].price),
            seller_id: results[i].seller.id,
            thumbnail: results[i].thumbnail.replace("http://", "https://"),
            link: results[i].permalink,
            condition: results[i].condition
          };
        
          // TODO: Add UI filter for condition
          if (!query.results.find((e) => e.id == result.id) && result.condition == "new") {
            query.results.push(result);
          }
          
          query.min_price = Math.min(query.min_price, result.price);
        }

        query.loaded = true;
      }, this.max_results);
    },
    sort_results_byPrice: function(query) {
      let results = [...query.results];
      
      return results.sort((a, b) => a.price - b.price);
    },
    get_sellers: function(query) {
      let sellers = [];
      let results = query.results

      for (let resultIdx in results) {
        let result = results[resultIdx];

        if (!sellers.includes(result.seller_id)) {
          sellers.push(result.seller_id);
        }
      }

      return sellers;
    }
  }
});
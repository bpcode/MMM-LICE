/* Magic Mirror
 * Module: MMM-ExchRate
 *
 * By Bhupesh, based on MMM-LICE
 *
 */
Module.register("MMM-ExchRate", {

    // Module config defaults.
    defaults: {
		accessKey: "",       // Free account & API Access Key at currencylayer.com
	    source: "AUD",       // USD unless you upgrade from free plan
		symbols: ["USD","INR"],         // Add in config file
        useHeader: false,    // true if you want a header
        header: "",          // Any text you want. useHeader must be true
        maxWidth: "300px",
        animationSpeed: 3000,
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 5 * 60 * 60 * 1000, // 5 hours

    },

    getStyles: function() {
        return ["MMM-ExchRate.css"];
    },

    getScripts: function() {
        return ["moment.js"];
    },


	start: function() {
        Log.info("Starting module: " + this.name);

        //  Set locale.
        this.url = "https://v6.exchangerate-api.com/v6/" + this.config.accessKey + "/latest/" + this.config.source;
        this.ExchRate = {};
        this.scheduleUpdate();
    },


    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("Show me the money . . .");
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("small", "bright", "light", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var ExchRate = this.ExchRate;


        var top = document.createElement("div");
        top.classList.add("list-row");


        // timestamp
        // var timestamp = document.createElement("div");
        // timestamp.classList.add("small", "bright", "timestamp");
        // timestamp.innerHTML = "Rate as of " + moment.unix(LICE.timestamp).format('h:mm a') + " today";
        // wrapper.appendChild(timestamp);


        // source currency
        // var source = document.createElement("div");
        // source.classList.add("small", "bright", "source");
        // source.innerHTML = "Source Currency = " + this.config.source;
        // wrapper.appendChild(source);


        // create table
        var Table = document.createElement("table");

        // create row and column for Currency
        var Row = document.createElement("tr");
        var Currency = document.createElement("th");
        Currency.classList.add("align-left", "small", "bright", "Currency");
        Currency.innerHTML = "Currency";
        Row.appendChild(Currency);

        // create row and column for Rate
        var Rate = document.createElement("th");
        Rate.classList.add("align-left", "small", "bright", "Rate");
        Rate.innerHTML = "Rate ("+this.config.source+")";
        Row.appendChild(Rate);
        Table.appendChild(Row);



        if (ExchRate.result == "success" ) {

            for (var i = 0; i < this.config.symbols.length; i++) {
              var Row = document.createElement("tr");
              var col1 = document.createElement("th");
              col1.classList.add("align-left", "small", "symbol");
              col1.innerHTML = this.config.symbols[i];
              Row.appendChild(col1);
              var col2 = document.createElement("th");
              col2.classList.add("align-left", "small", "symbol");
              col2.innerHTML = ExchRate.conversion_rates[this.config.symbols[i]].toFixed(2);
              Row.appendChild(col2);
              Table.appendChild(Row);
            }

        }
        wrapper.appendChild(Table);
        return wrapper;

    }, // closes getDom

    /////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_LICE') {
            this.hide();
        }  else if (notification === 'SHOW_LICE') {
            this.show(1000);
        }

    },


    processLICE: function(data) {
        this.ExchRate = data;
	//	console.log(this.LICE);
        this.loaded = true;
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getLICE();
        }, this.config.updateInterval);
        this.getLICE(this.config.initialLoadDelay);
    },

    getLICE: function() {
        this.sendSocketNotification('GET_LICE', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "LICE_RESULT") {
            this.processLICE(payload);

            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});

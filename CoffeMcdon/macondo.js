//Basic Version Beta
// The HTML and it was broken so I had to fix his button from here.
// It only had the basics: Click, Buy, Sell
//There are a few bugs; it's the beta Version.

var my_coffee = 0;
var my_gold = 0;

var click_power = 1;
let auto_sps = 0;
var engine_is_on = false;

// i store how many items the player buys here  { "Machete": 2, "cousin": 1 }
var my_inventory = {};

//small database to start
var the_shop = [
    { id: "machete", name: "Rusty Machete", type: "tool", price: 15, gives_click: 1, gives_auto: 0 },
    { id: "basket", name: "Broken Basket", type: "tool", price: 50, gives_click: 3, gives_auto: 0 },
    { id: "cousin", name: "The Cousin", type: "auto", price: 200, gives_click: 0, gives_auto: 2 },
    { id: "worker", name: "Day Laborer", type: "auto", price: 1000, gives_click: 0, gives_auto: 10 },
];

// this runs when the webpage loads
window.onload = function() {
    // console.log("game starting...");

    //1. CONNECT AND FIX THE BROKEN HTML
    var watermelon_btn = document.getElementById("sandia_clicker");

    // i delete the ugly onclick that was in the html file
    watermelon_btn.onclick = null;

    // put a span inside to only update the coffee number
    watermelon_btn.innerHTML = "☕ HARVEST <br> <span id='coffee_screen' style='font-size: 20px; 20px;'>0</span>";

    // 2. LOAD SAVE IF IT EXISTS
    load_data();
    calc_powers();
    draw_shop();
    update_texts();

    // 3. The game loop (Runs every 1 seconds = 1000 milliseconds)
    setInterval(function() {
        if(engine_is_on == true) {
            my_coffee = my_coffee + auto_sps;
            update_texts();
        }
    }, 1000);

    // auto save every 10 secs
    setInterval(function() {
        save_data();
    }, 10000);

    // 4. Bind Buttons
    connect_buttons();
};

// function to bind all the clicks in the ui
function connect_buttons() {

    // the main clicker
    var btn_click = document.getElementById("sandia_clicker");
    btn_click.addEventListener("mousedown", function() {
        my_coffee = my_coffee + click_power;
        update_texts();
    });

    // sell button
    var btn_sell = document.getElementById("sell");
    btn_sell.addEventListener("click", function() {
        // fixed price is 100 coffe = 1 gold for now
        if(my_coffee >=100) {
            var batches = Math.floor(my_coffee / 100);
            my_coffee = my_coffee - (batches * 100);
            my_gold = my_gold + batches;
            draw_shop(); //update in case player can afford something with gold now
            update_texts();
        }
    });

    // turn engine on/off
    var btn_engine = document.getElementById("btn_on");
    btn_engine.addEventListener("click", function() {
        if(engine_is_on == false) {
            engine_is_on = true;
        } else {
            engine_is_on = false;
        }
        update_texts();
    });

    // save button
    document.getElementById("saveBtn").addEventListener("click", function() {
        save_data();
        alert("Game saved bro");
    });

    // delete button
    document.getElementById("borrar").addEventListener("click", function() {
        localStorage.removeItem("macondo_beta_eng");
        location.reload(); // reloads the page
    });
}

// math to increase the price 15% every time you buy one
function get_new_price(base_price, how_many_i_have) {
    var multi = Math.pow(1.15, how_many_i_have);
    var final_price = base_price * multi;
    return Math.floor(final_price); // floor to remove ugly decimals
}

// checks inventory and adds up the powers
function calc_powers() {
    var power_c = 1;
    var power_a = 0;

    for (var the_id in my_inventory) {
        var amount = my_inventory[the_id];

        // find the item in the list
        for (var i =0; i < the_shop.length; i++) {
            if (the_shop[i].id == the_id ) {
                var info = the_shop[i];
                power_c = power_c + (info.gives_click * amount);
                power_a = power_a + (info.gives_auto * amount);
            }
        }
    }

    click_power = power_c;
    auto_sps = power_a;
}

// draaws the shop buttons
function draw_shop() {
    var box_list = document.getElementById("lista");
    box_list.innerHTML = ""; // clear the loading... text

    for (var i = 0; i < the_shop.length; i++) {
        var item = the_shop[i];

        var i_have = 0;
        if (my_inventory[item.id] > 0) {
            i_have = my_inventory[item.id];
        }

        var current_cost = get_new_price(item.price, i_have);

        var can_afford = false;
        if (my_coffee >= current_cost) {
            can_afford = true;
        }

        // building the html for the item like a caveman
        var div_item = document.createElement("div");
        div_item.style.border = "1px solid gray";
        div_item.style.marginBottom = "5px";
        div_item.style.padding = "5px";

        var text = "<b>" + item.name + " (x" + i_have + ")</b><br>";
        text += "Cost: " + current_cost + " ☕<br>";

        var button_html = "";
        if (can_afford == true) {
            button_html = "<button id='buy_" + item.id + "'>Buy</button>";
        } else {
            button_html = "<button id='buy" + item.id + "'disabled>Too poor</button>";
        }

        div_item.innerHTML = text + button_html;
        box_list.appendChild(div_item);

        // attach event to the newly created button
        var new_btn = document.getElementById("buy_" + item.id);
        if (new_btn != null) {
            new_btn.addEventListener("click", function(event) {
                // extract id from the button that was clicked ("buy_machete" -> "machete")
                var clean_id = event.target.id.replace("buy_", "");
                execute_buy(clean_id);
            });
        }
    }
}

function execute_buy(id_item) {
    var item_data = null;

    for (var i = 0; i < the_shop.length; i++) {
        if (the_shop[i].id == id_item) {
            item_data = the_shop[i];
        }
    }

    if (item_data != null) {
        var i_have = 0;
        if (my_inventory[id_item] > 0) {
            i_have = my_inventory[id_item];
        }

        var cost_it = get_new_price(item_data.price, i_have);

        if (my_coffee >= cost_it) {
            my_coffee = my_coffee - cost_it;
            my_inventory[id_item] = i_have + 1;

            calc_powers();
            draw_shop();
            update_texts();
        }
    }
}

// updates the numbers in the html
function update_texts() {
    var txt_cof = document.getElementById("coffee_screen");
    if(txt_cof != null) {
        txt_cof.innerText = Math.floor(my_coffee);
    }

    document.getElementById("oroTotal").innerText = Math.floor(my_gold);
    document.getElementById("pow").innerText = click_power;
    document.getElementById("sps").innerText = auto_sps;

    // green or red text for the engine
    var engine_text = document.getElementById("engine_status");
    if (engine_text) {
        if (engine_is_on) {
            engine_text.innerHTML = "ON";
            engine_text.style.setProperty("color", "#fff000", "important");
        } else {
            engine_text.innerHTML = "OFF";
            engine_text.style.setProperty("color", "#ff4444", "important");
        }
    }
}
// basic save function
function save_data() {
    var package = {
        c: my_coffee,
        o: my_gold,
        inv: my_inventory
    };

    var string_json = JSON.stringify(package);
    localStorage.setItem("macondo_beta_eng", string_json);
        
    var date_text = document.querySelector(".izq font[color='gray']");
    if(date_text !=null) {
        var d = new Date();
        date_text.innerHTML = "&nbsp;&nbsp;&nbsp;last save: " + d.getHours() + ":" + d.getMinutes();
    }
}

function load_data() {
    var saved_file = localStorage.getItem("macondo_beta_eng");

    if (saved_file != null) {
        var package = JSON.parse(saved_file);

        my_coffee = package.c;
        my_gold = package.o;

        if(package.inv != null) {
            my_inventory = package.inv;
        }
    }
}
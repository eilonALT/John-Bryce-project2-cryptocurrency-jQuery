$(function () {
    $(".progress").hide()


    const loadcoins = async function (data) {
        let cardsData = await data
        $("#coins-container").empty()

        let cards = ""
        for (let i = 0; i < 50; i++) {
            const element = cardsData[i];

            cards += `
            <div class="card text-black bg-light mb-3" style="max-width: 18rem;">
                <div class="card-header">${element.symbol}
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                    </div>
                </div>
                    <div class="card-body">
                        <h5 class="card-title">${element.name}</h5>
                        <div id="${element.id}" class="card-text">
                            <button class="show-more-button btn btn-outline-primary">show more</button>
                            <div class="show-more-info"></div>
                            <button class="show-less-button btn btn-outline-primary">show less</button>
                        </div>
                    </div>
            </div>
            `
        }
        $("#coins-container").append(cards)
        $(".show-more-info").hide()
        $(".show-less-button").hide()
        $(".progress").hide()
    }

    const loadMoreInfo = function (data, element) {
        element.empty()

        let moreInfo = ""
        moreInfo += `
            <hr>
            <img src="${data.image.small}" alt="none"><br><br>
            <p>USD : ${data.market_data.current_price.usd}$</p>
            <p>EUR : ${data.market_data.current_price.eur}€</p>
            <p>ILS : ${data.market_data.current_price.ils}₪</p><br>
        `
        element.append(moreInfo)
        element.toggle("slow")
        element.parent().children("button").toggle("fast")
    }


    $("#show-coins-button").on("click", function () {
        $(".progress").toggle("slow")

        $.ajax({
            url: "https://api.coingecko.com/api/v3/coins/list",
            timeout: '10000000',
            cache: true,
            success: data => {
                //console.table(data)
                loadcoins(data)
            }
        })
    })

    $(document).on("click", ".show-more-button", function () {
        let id = $(this).parent().attr("id")
        $.ajax({
            url: `https://api.coingecko.com/api/v3/coins/${id}`,
            success: data => {
                //console.table(data)
                loadMoreInfo(data, $(this).parent().children("div"))
            }
        })
    })

    $("#about-button").on("click", function () {
        $("#coins-container").empty()
        let about = `
            <p class ="about">
                author: eilon alter <br>
                date: 09/01/2022 <br><br>
                this website ....
            </p>
        `
        $("#coins-container").append(about)
    })

    $(document).on("click", ".show-less-button", function () {
       new Number(godel)=prompt("enter godel")
        $(this).parent().children("div").toggle("slow")
        $(this).parent().children("button").toggle("fast")
    })


    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(".card").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).on("click", ".form-check-input:checked", function () {
        $(document).dialog({
            title: "hello"
        })
    })


})
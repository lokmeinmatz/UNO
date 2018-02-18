import {cardColors, uiColors} from "./colors"
import {GameUpdate} from "./utils"

const $ : JQueryStatic = require("./jquery")




class UI {

    selectedHand : JQuery
    selectedPreview : JQuery 

    init() {
        //must be called on domready
        
        
        //Set ui colors
        const body = $("body").get(0)
        body.style.setProperty("--verylight", uiColors.verylight)
        body.style.setProperty("--light", uiColors.light)
        body.style.setProperty("--medium", uiColors.medium)
        body.style.setProperty("--dark", uiColors.dark)
        body.style.setProperty("--verydark", uiColors.verydark)
        body.style.setProperty("--active", uiColors.active)
        body.style.setProperty("--success", uiColors.success)


        this.selectedPreview = $("#selected-card")

        //Set modal handlers
        $(".tab-btn#tab-join-btn").click(function() {
            $(this).addClass("active")
            $(".tab-btn#tab-create-btn").removeClass("active")

            //set modals
            $(".tab-content#create-session-tab").removeClass("active")
            $(".tab-content#join-session-tab").addClass("active")
        })
        $(".tab-btn#tab-create-btn").click(function() {
            $(this).addClass("active")
            $(".tab-btn#tab-join-btn").removeClass("active")

            //set modals
            $(".tab-content#join-session-tab").removeClass("active")
            $(".tab-content#create-session-tab").addClass("active")
        })

        

        

        

        //selected card handler
        $("#selected-card").click(function() {
            //close selectedPreview if is clicked    
            UIi.selectedPreview.removeClass("open")
    
            //show hand card
            if(UIi.selectedHand) {
                //sets scale of handcard to 1
                UIi.selectedHand.removeClass("selected")
            }
        })


        $(".play").click(function() {
            //get type of card
            const ct = UIi.selectedPreview.data("cardtype")
            console.log("Playing card "+ct)
            //remove card from hand
            UIi.selectedHand.remove()
            UIi.addPlayedCard(ct)
        })
    }

    setModal(id : string) {
        $(".modal").removeClass("active")
        $(".modal#"+id).addClass("active")
    }

    setHandClickHandler() {
        $("#handcards .handcard").off("click")
        $("#handcards .handcard").click(function(){
            
            if(UIi.selectedHand) {
                //sets scale of handcard to 1
                UIi.selectedHand.removeClass("selected")
            }

            if(!UIi.selectedHand || UIi.selectedHand.first().get(0) != $(this).get(0)) {
                UIi.selectedHand = $(this)
                //get cardtype
                const ct = UIi.selectedHand.data("cardtype")
                UIi.setPreviewCard(ct)

                UIi.selectedPreview.addClass("open")
                UIi.selectedHand.addClass("selected")

            }
            else {
                UIi.selectedHand = null
            }
            

        })
    }

    
    setPreviewCard(cardType: string) {
        if(cardType.charAt(0) == "r")this.selectedPreview.css("background-color", cardColors.red)
        else if(cardType.charAt(0) == "g")this.selectedPreview.css("background-color",cardColors.green)
        else if(cardType.charAt(0) == "b")this.selectedPreview.css("background-color", cardColors.blue)
        else if(cardType.charAt(0) == "y")this.selectedPreview.css("background-color", cardColors.yellow)
        this.selectedPreview.find("#num").text(cardType.charAt(1))
        this.selectedPreview.data("cardtype", cardType)
    }  
    
    addHandCard(cardType: string) {
        const root = $("#handcards")
    
        const card = $("<p class='card handcard'>")
        if(cardType.charAt(0) == "r")card.css("background-color", cardColors.red)
        else if(cardType.charAt(0) == "g")card.css("background-color",cardColors.green)
        else if(cardType.charAt(0) == "b")card.css("background-color", cardColors.blue)
        else if(cardType.charAt(0) == "y")card.css("background-color", cardColors.yellow)
        card.text(cardType.charAt(1))
        card.data("cardtype", cardType)
        root.append(card)
    }

    addPlayedCard(cardType: string) {

    
        const root = $("#played-cards")
        if(root.children().length > 6) {
            root.children().first().remove()
        }
    
        //Set transparency
        root.children().each((index, val) => {
            $(val).css("opacity", 1.0 - (index/10))
        })
    
        const card = $("<p class='card'>")
        if(cardType.charAt(0) == "r")card.css("background-color", cardColors.red)
        else if(cardType.charAt(0) == "g")card.css("background-color", cardColors.green)
        else if(cardType.charAt(0) == "b")card.css("background-color", cardColors.blue)
        else if(cardType.charAt(0) == "y")card.css("background-color", cardColors.yellow)
    
        card.text(cardType.charAt(1))
        card.css("transform", "rotate("+(Math.random()*50-25)+"deg)")
        root.append(card)
        
    }

   
    setModalVisiblilty(visible: boolean) {
        if(visible) {
            $(".modal-container").addClass("active")
        }
        else {
            $(".modal-container").removeClass("active")
        }
    }

    setOtherPlayers(players: GameUpdate["players"], active: string) {
        //Set players
        const jPlayers = $("#players")
        jPlayers.children().remove()

        for(let player of players) {
            const jPlayer = $("<div class='player'>")
            if(player.id == active)jPlayer.addClass("active")
            jPlayer.append(`<h3>${player.name}</h3>`)
            jPlayer.append(`<p class='handcard-count'>${player.cards}</p>`)
            jPlayers.append(jPlayer)
        }
    }

    setIamActive(active : boolean) {
        if(active)$('#handcard-wrapper').addClass("active")
        else $('#handcard-wrapper').removeClass("active")
    }

    

    setDirection(clockwise : boolean) {
        const spinner = $(".spinner")
        const container = $(".spinner-div")
        container.addClass("zoom")
    
        window.setTimeout(() =>  {
            if(clockwise)spinner.removeClass("ccw")
            else spinner.addClass("ccw")
        }, 250)
    
        //remove zoom class
        window.setTimeout(() => {
            container.removeClass("zoom")
        }, 500)
        
    }

    updateDeck(height: number, onDraw : Function) {
        const Jdeck = $("#deck")
        Jdeck.children().remove()
        for(let i = 0; i < height; i++) {
            const card = $("<div class='card deck-card'>")
            card.css("left", i*5)
            card.css("top", i*5)
            Jdeck.append(card)
        }
        Jdeck.children().last().off("click").click(function() {
            onDraw()
        })
    }
}

const UIi : UI = new UI()

export default UIi
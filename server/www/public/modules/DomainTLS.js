import {Popup} from "./Popup.js"

export class DomainTLS extends Popup {
    constructor(Domain) {
        super()
        this.Domain = Domain
        $('<BUTTON>').addClass("modal-close is-large").prop("aria-label","close").appendTo(this.Modal).click(()=>this.Destroy())

        this.Title.text("TLS for " + Domain)
        this.Refresh()
        this.RefreshTimer = setInterval(this.Refresh.bind(this), 1000)
        this.Log = $('<PRE>').appendTo(this.Body)

        this.CloseButton = $('<BUTTON>').appendTo(this.FooterRight).addClass("button is-success").text("Close").click(()=>{
            this.Destroy()
        })
        this.ProvisionButton = $('<BUTTON>').appendTo(this.FooterLeft).addClass("button is-success").text("Provision TLS").click(()=>{
            API("ProvisionTLS", this.Domain)
        })
    }
    async Refresh() {
        const Log = await API("TLSLog", this.Domain)
        this.Log.text(Log)
    }
    Destroy() {
        this.Modal.remove()
        clearInterval(this.RefreshTimer)
    }
}
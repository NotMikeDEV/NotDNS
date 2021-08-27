export class Popup {
    constructor() {
        this.Data = new Promise((R)=>this.Login=R)
        this.Modal = $('<DIV>').addClass("modal").appendTo($('body')).addClass("is-active")
        this.ModalBackground = $('<DIV>').addClass("modal-background").appendTo(this.Modal)
        this.ModalCard = $('<DIV>').addClass("modal-card").appendTo(this.Modal)

        this.Header = $('<HEADER>').addClass("modal-card-head").appendTo(this.ModalCard)
        this.Title = $('<P>').addClass("modal-card-title").appendTo(this.Header)

        this.Body = $('<SECTION>').addClass("modal-card-body").appendTo(this.ModalCard)
        
        this.Footer = $('<FOOTER>').addClass("modal-card-foot").appendTo(this.ModalCard)
        this.FooterNAV = $('<NAV>').addClass("level").appendTo(this.Footer).width("100%")
        this.FooterLeft = $('<DIV>').addClass("level-left").appendTo(this.FooterNAV)
        this.FooterRight = $('<DIV>').addClass("level-right").appendTo(this.FooterNAV)
    }
    Hide() {
        this.Modal.hide()
    }
    Show() {
        this.Modal.show()
    }
    Destroy() {
        this.Modal.remove()
    }
}
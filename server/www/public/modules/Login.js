import {Popup} from "./Popup.js"

export class Login extends Popup {
    constructor() {
        super()
        this.Data = new Promise((R)=>this.Login=R)
        this.Title.text("Log In")

        this.ErrorText = $('<DIV>').appendTo(this.Body).addClass("has-text-danger is-size-4")
        this.LoginForm = $('<FORM>').appendTo(this.Body).submit(()=>{this.Button.click(); return false})
        this.Submit = $('<INPUT>').addClass("input").prop('type', 'submit').appendTo(this.LoginForm).hide()
        this.LoginTable = $('<TABLE>').appendTo(this.LoginForm)
        this.UsernameRow = $('<TR>').appendTo(this.LoginTable)
        this.UsernameField = $('<TD>').appendTo(this.UsernameRow).text("Username").addClass("is-size-4")
        this.Username = $('<INPUT>').addClass("input").prop('type', 'text').appendTo($('<TD>').appendTo(this.UsernameRow)).width("300")
        
        this.PasswordRow = $('<TR>').appendTo(this.LoginTable)
        this.PasswordField = $('<TD>').appendTo(this.PasswordRow).text("Password").addClass("is-size-4")
        this.Password = $('<INPUT>').addClass("input").prop('type', 'password').appendTo($('<TD>').appendTo(this.PasswordRow)).width("300")

        this.Button = $('<BUTTON>').appendTo(this.FooterRight).addClass("button is-active").text("Log In")
        this.Button.click(async()=>{
            const Data = await window.API("Auth")
            if (Data) {
                this.Login(Data)
                this.Modal.hide()
            } else {
                this.ErrorText.text("Invalid Username/Password.")
            }
        })
        setTimeout(()=>{
        if (this.Username.val() && this.Password.val())
            this.Button.click()
        },1000)
    }
    get AuthString() {
        return JSON.stringify({Username: this.Username.val(), Password: this.Password.val()})
    }
}
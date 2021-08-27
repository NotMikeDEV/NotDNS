import {Popup} from "./Popup.js"
import {RecordEditor} from "./RecordEditor.js"
import {DomainTLS} from "./DomainTLS.js"

export class DomainList {
    constructor(Parent) {
        this.Table = $('<TABLE>').appendTo(Parent).addClass("table")
        this.TableHeader = $('<THEAD>').appendTo(this.Table)
        this.TableHeaderRow = $('<TR>').appendTo(this.TableHeader)
        $('<TD>').appendTo(this.TableHeaderRow).text("Domains").addClass("is-size-4")
        this.AddDomain = $('<BUTTON>').appendTo($('<TD>').appendTo(this.TableHeaderRow)).text("Add").addClass("button is-primary")
        this.AddDomain.click(()=>{
            const Dialog = new Popup()
            Dialog.Title.text("Add Domain")
            const Input = $('<INPUT>').appendTo(Dialog.Body).addClass("input").prop("placeholder", "example.com").focus()
            const CancelButton = $('<BUTTON>').appendTo(Dialog.FooterRight).text("Cancel").addClass("button is-danger")
            CancelButton.click(()=>Dialog.Destroy())
            const AddButton = $('<BUTTON>').appendTo(Dialog.FooterRight).text("Add").addClass("button is-primary")
            AddButton.click(async()=>{
                if (!Input.val())
                    return
                const Status = await window.API("AddDomain", Input.val())
                if (Status === true) {
                    Dialog.Destroy()
                    this.LoadList()
                } else {
                    alert(Status)
                }
            })
        })
        this.TableBody = $('<TBODY>').appendTo(this.Table)
        this.LoadList()
    }
    async LoadList() {
        const Domains = await window.API("Domains")
        this.TableBody.empty()
        for (let x in Domains) {
            const Row = $('<TR>').appendTo(this.TableBody)
            const Element = $('<TD>').appendTo(Row).text(Domains[x])
            const ManageButton = $('<BUTTON>').appendTo($('<TD>').appendTo(Row)).text("Manage Records").addClass("button is-info").click(()=>{
                new RecordEditor(Domains[x])
            })
            const TLSButton = $('<BUTTON>').appendTo($('<TD>').appendTo(Row)).text("TLS").addClass("button is-info").click(()=>{
                new DomainTLS(Domains[x])
            })
        }
    }
}
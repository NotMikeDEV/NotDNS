import {Popup} from "./Popup.js"

function TTLDropdown(Value) {
    const Dropdown = $('<SELECT>')
    const Values = {
        60: "1 min",
        300: "5 mins",
        900: "15 mins",
        1800: "30 mins",
        3600: "1 hour"
        }
    for (let x in Values)
        $('<OPTION>').appendTo(Dropdown).val(x).text(Values[x])
    return Dropdown
}
function ValueEditor(Type, Value) {
    const Holder = $('<DIV>')
    if (Type == "MX") {
        const Parts = Value.split(" ")
        if (Parts.length < 2)
            Parts.push("")
        $('<INPUT>').appendTo(Holder).prop("type", "text").prop("name", "prio").prop('placeholder', 'Prio').addClass("input").width(50).val(Parts[0])
        $('<INPUT>').appendTo(Holder).prop("type", "text").prop("name", "host").prop('placeholder', 'Target').addClass("input").width(250).val(Parts[1])
    } else if (Type == 'SRV') {
        const Parts = Value.split(" ")
        while (Parts.length < 4)
            Parts.push("")
        $('<INPUT>').appendTo(Holder).prop("type", "text").prop("name", "prio").prop('placeholder', 'Prio').addClass("input").width(50).val(Parts[0])
        $('<INPUT>').appendTo(Holder).prop("type", "text").prop("name", "weight").prop('placeholder', 'Weight').addClass("input").width(50).val(Parts[1])
        $('<INPUT>').appendTo(Holder).prop("type", "text").prop("name", "port").prop('placeholder', 'Port').addClass("input").width(50).val(Parts[2])
        $('<INPUT>').appendTo(Holder).prop("type", "text").prop("name", "target").prop('placeholder', 'Target').addClass("input").width(150).val(Parts[3])
    } else {
        $('<INPUT>').appendTo(Holder).prop('name', 'value').width(300).addClass("input").val(Value)
    }
    return Holder
}
function SaveValue(Type, ValueField) {
    if (Type == "MX") {
        return ValueField.find("[name*='prio']").val()
            + " " + ValueField.find("[name*='host']").val()
    } else if (Type == "SRV") {
        return Request.value = ValueField.find("[name*='prio']").val()
            + " " + ValueField.find("[name*='weight']").val()
            + " " + ValueField.find("[name*='port']").val()
            + " " + ValueField.find("[name*='target']").val()
    } else {
        return Request.value = ValueField.find("[name*='value']").val()
    }
}
export class RecordEditor extends Popup {
    constructor(Domain) {
        super()
        this.Domain = Domain
        $('<BUTTON>').addClass("modal-close is-large").prop("aria-label","close").appendTo(this.Modal).click(()=>this.Destroy())
        this.ModalCard.width(950)
        this.Title.text(Domain)
        this.DeleteButton = $('<BUTTON>').appendTo(this.FooterLeft).addClass("button is-danger").text("Delete Domain").click(async()=>{
            if (confirm("Delete Domain?")) {
                await API("DeleteDomain", Domain)
                this.Destroy()
                window.DomainList.LoadList()
            }
        })
        this.CloseButton = $('<BUTTON>').appendTo(this.FooterRight).addClass("button is-success").text("Close").click(()=>{
            this.Destroy()
            window.DomainList.LoadList()
        })
        this.Table = $('<TABLE>').appendTo(this.Body).addClass("table")
        this.TableHeader = $('<THEAD>').appendTo(this.Table)
        this.TableHeaderRow = $('<TR>').appendTo(this.TableHeader)
        const Hostname = $('<INPUT>').appendTo($('<TD>').appendTo(this.TableHeaderRow)).addClass("input").prop("placeholder", "@").width(150)
        const TTL = TTLDropdown().appendTo($('<DIV>').appendTo($('<TD>').appendTo(this.TableHeaderRow)).addClass("select")).width(50)
        const Type = $('<SELECT>').appendTo($('<DIV>').appendTo($('<TD>').appendTo(this.TableHeaderRow)).addClass("select")).width(50)
            $('<OPTION>').appendTo(Type).val("A").text("A")
            $('<OPTION>').appendTo(Type).val("AAAA").text("AAAA")
            $('<OPTION>').appendTo(Type).val("TXT").text("TXT")
            $('<OPTION>').appendTo(Type).val("CNAME").text("CNAME")
            $('<OPTION>').appendTo(Type).val("MX").text("MX")
            $('<OPTION>').appendTo(Type).val("NS").text("NS")
            $('<OPTION>').appendTo(Type).val("PTR").text("PTR")
            $('<OPTION>').appendTo(Type).val("SRV").text("SRV")
            $('<OPTION>').appendTo(Type).val("WEB").text("WEB")
        const ValueField = $('<TD>').appendTo(this.TableHeaderRow)
        ValueEditor("A", "").appendTo(ValueField)
        Type.change(()=>{
            ValueEditor(Type.val(), "").appendTo(ValueField.empty())
        })
        const AddButton = $('<BUTTON>').appendTo($('<TD>').appendTo(this.TableHeaderRow).width(75)).text("+").addClass("button").click(async()=>{
            const Record = {
                Domain: this.Domain,
                Name: Hostname.val(),
                TTL: TTL.val(),
                Type: Type.val(),
                Value: SaveValue(Type.val(), ValueField)
            }
            await API("AddRecord", Record)
            this.Refresh()
        })
        this.TableBody = $('<TBODY>').appendTo(this.Table)
        this.Refresh()
    }
    async Refresh() {
        const Records = await API("GetRecords", this.Domain)
        this.TableBody.empty()
        for (let x in Records) {
            this.RenderRow(Records[x]).appendTo(this.TableBody)
        }
    }
    RenderRow(Record) {
        const Row = $('<TR>')
        const Name = $('<TD>').appendTo(Row).text(Record.Name)
        const TTL = $('<TD>').appendTo(Row).text(Record.TTL)
        const Type = $('<TD>').appendTo(Row).text(Record.Type)
        const ValueField = $('<TD>').appendTo(Row).text(Record.Value)
        const Buttons = $('<TD>').appendTo(Row)
        const Delete = async()=>{
            if (confirm("Delete Record?")) {
                await API("DeleteRecord", {Domain: this.Domain, ID: Record.ID})
                this.Refresh()
            }
        }
        const Edit = ()=>{
            ValueEditor(Record.Type, Record.Value).appendTo(ValueField.empty())
            Buttons.empty()
            $('<I>').addClass('fas fa-check').addClass("is-clickable").appendTo($('<BUTTON>').appendTo(Buttons).addClass("button is-success icon").click(Save))
            $('<I>').addClass('fas fa-times').addClass("is-clickable").appendTo($('<BUTTON>').appendTo(Buttons).addClass("button is-danger icon").click(Cancel))
        }
        const Save = async()=>{
            const NewRecord = {
                Domain: this.Domain,
                ID: Record.ID,
                TTL: Record.TTL,
                Value: SaveValue(Record.Type, ValueField)
            }
            await API("SaveRecord", NewRecord)
            Record.Value = NewRecord.Value
            Record.TTL = NewRecord.TTL
            ValueField.text(Record.Value)
            Buttons.empty()
            $('<I>').addClass('fas fa-edit').addClass("is-clickable").appendTo($('<BUTTON>').appendTo(Buttons).addClass("button is-info icon").click(Edit))
            $('<I>').addClass('fas fa-trash').addClass("is-clickable").appendTo($('<BUTTON>').appendTo(Buttons).addClass("button is-danger icon").click(Delete))
        }
        const Cancel = ()=>{
            ValueField.text(Record.Value)
            Buttons.empty()
            $('<I>').addClass('fas fa-edit').addClass("is-clickable").appendTo($('<BUTTON>').appendTo(Buttons).addClass("button is-info icon").click(Edit))
            $('<I>').addClass('fas fa-trash').addClass("is-clickable").appendTo($('<BUTTON>').appendTo(Buttons).addClass("button is-danger icon").click(Delete))
        }
        $('<I>').addClass('fas fa-edit').addClass("is-clickable").appendTo($('<BUTTON>').appendTo(Buttons).addClass("button is-info icon").click(Edit))
        $('<I>').addClass('fas fa-trash').addClass("is-clickable").appendTo($('<BUTTON>').appendTo(Buttons).addClass("button is-danger icon").click(Delete))
        return Row
    }
}
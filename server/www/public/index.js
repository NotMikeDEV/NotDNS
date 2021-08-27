import {Login} from "./modules/Login.js"
import {DomainList} from "./modules/DomainList.js"

window.Authentication = new Login()
$(async ()=>{
    await window.Authentication.Data
    window.DomainList = new DomainList($('#page'))
})

window.API = async(Type, Data)=>{
    try {
        var Response = await fetch("/API", { method: 'POST', cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.Authentication.AuthString
            },
            body: JSON.stringify({Type, Data})
        });
        Response = await Response.json()
        console.log("API", Type, Data, Response)
        return Response;
    } catch (e) {
        console.log(e)
        window.Authentication.Show()
        return undefined
    }
}
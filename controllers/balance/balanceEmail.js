import {
    Models
} from "../../models";
// creating balance table model
import { Factories,Lib } from '../../utils';
let balanceTable = Models.balanceModel;
const path = require('path');

export const sendBalanceEmail = (req) => {
    global.show("###### send Balance email######");

    return new Promise(async(resolve, reject) => {

        let received = req ? req.body : null;
        if (received)  {
            global.show({
            received
            });
        } else {
            return reject({
                err: true,
                message: "Email data is empty!",
            });
        }

        let email = "torben@rudgaard.com;";
        
        //let email = "satendra.rawat2011@gmail.com";
        const client = new Factories.Email(email);

        /* setSubject is used to set the subject of the email. */
        client.setSubject(`BitCoin Investment Monthly Payment ${received.profitMonth}` );

        // read the html template of balance email updates
        let html = await Lib.readFile(path.join( "templates/emails/balance/balance.html"));

        html = html.replace("[NICKNAME]", received.userName)
        html = html.replace("[MONTHPROFIT]", received.depositProfit);
        html = html.replace("[MONTH-YEAR]", received.profitMonth);
        html = html.replace("[TOTALINVEST]", received.allInvestments);
        html = html.replace("[TOTALPROFIT]", received.totalProfitPaid);
        html = html.replaceAll("[INVESTORSPAGE]", "http://localhost:4200/");

        /* setHtml to set the html as body of the email */
        client.setHtml(html);

        /* attach function attaches the pdf files which are at the google drive */
        /* you need to provide the fileId, which should've been saved in the investor model. */
        /* you can attach multiple documents like that. The attachment must be a pdf,  */
        /* otherwise your the client will throw an error. */
        //await client.attach("1GNTkCg3oGXpyyhl5ChoMSNlBMhpeKdpd");
        //await client.attach(fileIdB);

        /* when you have set everything, call send function to send the email. */
        await client.send();

          global.saveLogs({
            logType:'EMAIL',
            investorName:received.userName,
            description:`Sent email to ${received.userName} that ${received.userName} was paid as Monthly Profit.`,
        })

        return resolve({"msg": "Email sent"});
    });

}
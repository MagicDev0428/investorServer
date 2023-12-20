import {
    Models
} from "../../models";
// creating balance table model
let balanceTable = Models.balanceModel;


//
// Update EXISTING Balance with the data from the form
//
export const updateBalance = (req) => {

    global.show("###### update balance ######")
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    return new Promise(async (resolve, reject) => {
        try {

            // Check for received data
            if (!received._id) {
                return reject({err:true,message:"_id is not recieved in form."});
            }

            const balanceId = received._id
            delete received._id             // deleting id so it will not update the document id

            balanceTable = null;
            balanceTable = await Models.balanceModel.findOneAndUpdate({
                    _id: balanceId
                },
                received, {
                    new: true
                }
            );

            if(!balanceTable){
                return reject({
                    err:true,
                    message:`Balance id ${balanceId} is not exist!`
                })
            }
            return resolve({
                err: false,
                balances: balanceTable
            });

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    })
}
import {
    Models
} from "../../models";
// creating investor table model
let investorTable = Models.Investor;



// save copy paste for specific investor
export const saveCopyPaste = (req) => {
    global.show("###### Save Hidden Remarks ######");
    const received = req ? req.body : null;
    global.show({received})
    return new Promise(async (resolve, reject) => {
        try {
            if (!received) {
                return reject({

                    err: true,
                    message: "Save hidden body is empty!",
                });
            }

            investorTable = null;
            investorTable = await Models.Investor.findByIdAndUpdate(received._id, {
                $push: {
                    copyPaste: received.copyPaste
                }
            }, {
                new: true,
                projection: {
                    copyPaste: 1,
                    _id: 1
                }
            });

            if (investorTable) {
                return resolve({
                    err: false,
                    investorCopyPaste: investorTable
                });
            }
            return reject({
                err: true,
                message: "Error in saving hidden remarks for investor!"
            });

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    })

}


// get copy paste for specific investor
export const getCopyPaste = (investorId) => {
    global.show("###### Get Copy Paste ######");
    global.show(investorId)
    return new Promise(async (resolve, reject) => {
        try {
            if (!investorId) {
                return reject({
                    err: true,
                    message: "Investor id is required!",
                });
            }

            investorTable = null;
            investorTable = await Models.Investor.findById(investorId, {
                copyPaste: 1,
                _id: 1
            });

            if (investorTable) {
              
                return resolve({
                    err: false,
                    investorCopyPaste: investorTable
                });
            }
            return reject({
                err: true,
                message: "investor id does not exist!"
            });

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    })

}
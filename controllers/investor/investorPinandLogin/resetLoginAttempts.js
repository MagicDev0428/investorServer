import {
    Models
} from "../../../models";


// update investor last login date and time 
export const resetLoginAttempts = (investorId) => {
    global.show("###### Reset Login Attempts ######")

    return new Promise(async (resolve, reject) => {
        try {

            
            
            if (!investorId) {
                return reject({
                    status: 404,
                    err: true,
                    message: "Investor Id is required for update login attempts.",
                });
            }
            const updatedInvestorLoginAttempts = await Models.Investor.findByIdAndUpdate(
                investorId, {
                    $set: {
                        loginAttempts: 0,
                        status:"ACTIVE"
                    }
                }, {
                    new: true
                }
            );

            // Return investor update data
            if (updatedInvestorLoginAttempts) {
                return resolve({
                    status: 200,
                    err: false,
                    investors: "Investor Login Atttempt has been updated successfully."
                });
            }

            return reject({
                status: 400,
                err: true,
                message: "Investor not found!"
            });
        } catch (error) {
            return reject({
                status: 500,
                err: true,
                message: error.message
            })
        }
    })
}
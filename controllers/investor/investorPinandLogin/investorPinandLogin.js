import {
    Models
} from "../../../models";


// update investor last login date and time 
export const lastLoginDate = (investorId) => {
    global.show("###### Investor Last Login ######")

    return new Promise(async (resolve, reject) => {
        try {

            const newLastLoginDate = new Date();
            // validating id and nickname are exist or not
            if (!investorId) {
                return reject({
                    status: 404,
                    err: true,
                    message: "Investor Id is required for update login date.",
                });
            }
            const updatedInvestorLoginDate = await Models.Investor.findByIdAndUpdate(
                investorId, {
                    $set: {
                        LastLoginDate: newLastLoginDate
                    }
                }, {
                    new: true
                }
            );

            // Return investor update data
            if (updatedInvestorLoginDate) {
                return resolve({
                    status: 200,
                    err: false,
                    investors: "Investor Login Date has been updated successfully"
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

// investor login with Pin Code
export const loginWithPin = (req) => {
    global.show("###### Login with Pin and Email ######");
    const received = req ? req.body : null;
    return new Promise(async (resolve, reject) => {
        try {
            // Checking if investor body is empty or not
            if (!received) {
                return reject({
                    status: 404,
                    err: true,
                    message: "Investor form is empty!",
                });
            }

            const investor_ = await Models.Investor.findOne({
                email: req.params.investoremail
            });



            if (!investor_) {
                return reject({
                    status: 404,
                    err: true,
                    message: "Investor email is not found!",
                });
            }

            // if investor status is FROZEN then return back
            if (investor_.status === 'FROZEN') {
                return reject({
                    status: 403,
                    err: true,
                    message: "THIS ACCOUNT IS FROZEN PLEASE CONTACT BEE OR TORBEN",
                });
            }


            if (investor_.pincode !== received.pincode) {

                // incremented login attemp if piccode is not correct
                const updatedUser = await Models.Investor.findByIdAndUpdate(investor_._id, {
                    $inc: {
                        loginAttempts: 1
                    }
                }, {
                    new: true
                });

                if (updatedUser.loginAttempts >= 3) {
                    // If loginAttempts reach 3, update user status to "FROZEN"
                    await Models.Investor.findByIdAndUpdate(updatedUser._id, {
                        $set: {
                            status: 'FROZEN'
                        }
                    });
                }
                return reject({
                    status: 401,
                    err: true,
                    message: "PINODE IS WRONG, TRY AGAIN!",
                });
            }

            // if investor will successfully loged in then it will set loginAttempts to 0
            await Models.Investor.findByIdAndUpdate(investor_._id, {
                $set: {
                    loginAttempts: 0
                }
            });


            // save log for to create investment 
            global.saveLogs({
                logType: 'LOGIN',
                investorName: investor_._id,
                description: `${investor_.nickname} logged into portfolio via PinCode.`,
            })

            return resolve({
                status: 200,
                err: false,
                investor: investor_._id
            });

        } catch (error) {
            return reject({
                status: 500,
                err: true,
                message: error.message
            })
        }
    });
}
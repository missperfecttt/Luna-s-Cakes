const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();


// ============================================
// BASIC SERVER CONFIGURATION
// ============================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ============================================
// TEMPORARY UPLOAD FOLDER
// ============================================

const uploadDir = path.join(
    __dirname,
    "uploads"
);

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(
        uploadDir,
        {
            recursive: true
        }
    );

}


// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================

const upload = multer({

    dest: uploadDir,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

});


// ============================================
// TELEGRAM CONFIGURATION
// ============================================

const BOT_TOKEN =
    process.env.TELEGRAM_BOT_TOKEN;

const CHAT_ID =
    process.env.TELEGRAM_CHAT_ID;


if (!BOT_TOKEN) {

    console.error(
        "❌ TELEGRAM_BOT_TOKEN is missing from .env"
    );

}


if (!CHAT_ID) {

    console.error(
        "❌ TELEGRAM_CHAT_ID is missing from .env"
    );

}


const TELEGRAM_API =
    `https://api.telegram.org/bot${BOT_TOKEN}`;


// ============================================
// ESCAPE TELEGRAM HTML
// ============================================

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

}


// ============================================
// GENERATE ORDER ID
// ============================================

function generateOrderId() {

    const number =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `LC-${number}`;

}


// ============================================
// CREATE ORDER BUTTONS
// ============================================

function createOrderButtons(
    orderId,
    status
) {

    // ========================================
    // PAYMENT PENDING
    // ========================================

    if (status === "pending") {

        return [

            [

                {
                    text:
                        "🟢 Verify Payment",

                    callback_data:
                        `verify_${orderId}`
                },

                {
                    text:
                        "❌ Reject Payment",

                    callback_data:
                        `reject_${orderId}`
                }

            ],

            [

                {
                    text:
                        "👩‍🍳 Preparing",

                    callback_data:
                        `preparing_${orderId}`
                },

                {
                    text:
                        "📦 Ready",

                    callback_data:
                        `ready_${orderId}`
                }

            ],

            [

                {
                    text:
                        "🚚 Delivered",

                    callback_data:
                        `delivered_${orderId}`
                },

                {
                    text:
                        "❌ Cancel",

                    callback_data:
                        `cancel_${orderId}`
                }

            ]

        ];

    }


    // ========================================
    // PAYMENT VERIFIED
    // ========================================

    if (status === "verified") {

        return [

            [

                {
                    text:
                        "👩‍🍳 Preparing",

                    callback_data:
                        `preparing_${orderId}`
                },

                {
                    text:
                        "📦 Ready",

                    callback_data:
                        `ready_${orderId}`
                }

            ],

            [

                {
                    text:
                        "🚚 Delivered",

                    callback_data:
                        `delivered_${orderId}`
                },

                {
                    text:
                        "❌ Cancel",

                    callback_data:
                        `cancel_${orderId}`
                }

            ]

        ];

    }


    // ========================================
    // PREPARING
    // ========================================

    if (status === "preparing") {

        return [

            [

                {
                    text:
                        "📦 Ready",

                    callback_data:
                        `ready_${orderId}`
                },

                {
                    text:
                        "❌ Cancel",

                    callback_data:
                        `cancel_${orderId}`
                }

            ],

            [

                {
                    text:
                        "🚚 Delivered",

                    callback_data:
                        `delivered_${orderId}`
                }

            ]

        ];

    }


    // ========================================
    // READY
    // ========================================

    if (status === "ready") {

        return [

            [

                {
                    text:
                        "🚚 Delivered",

                    callback_data:
                        `delivered_${orderId}`
                },

                {
                    text:
                        "❌ Cancel",

                    callback_data:
                        `cancel_${orderId}`
                }

            ]

        ];

    }


    // ========================================
    // FINAL STATES
    // ========================================

    return [];

}


// ============================================
// SEND TELEGRAM MESSAGE
// ============================================

async function sendTelegramMessage(
    text,
    buttons = null
) {

    const body = {

        chat_id:
            CHAT_ID,

        text:
            text,

        parse_mode:
            "HTML"

    };


    if (buttons) {

        body.reply_markup = {

            inline_keyboard:
                buttons

        };

    }


    const response =
        await fetch(

            `${TELEGRAM_API}/sendMessage`,

            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(body)

            }

        );


    return response.json();

}


// ============================================
// SEND PHOTO AS REPLY TO ORDER
// ============================================

async function sendTelegramPhoto(
    filePath,
    caption,
    replyToMessageId
) {

    const formData =
        new FormData();


    formData.append(
        "chat_id",
        CHAT_ID
    );


    formData.append(
        "photo",
        new Blob([
            fs.readFileSync(filePath)
        ]),
        path.basename(filePath)
    );


    formData.append(
        "caption",
        caption
    );


    formData.append(
        "parse_mode",
        "HTML"
    );


    if (replyToMessageId) {

        formData.append(

            "reply_parameters",

            JSON.stringify({

                message_id:
                    replyToMessageId,

                allow_sending_without_reply:
                    true

            })

        );

    }


    const response =
        await fetch(

            `${TELEGRAM_API}/sendPhoto`,

            {

                method:
                    "POST",

                body:
                    formData

            }

        );


    return response.json();

}


// ============================================
// DELETE TEMPORARY FILES
// ============================================

function deleteUploadedFiles(files) {

    if (!files) {

        return;

    }


    for (
        const field
        of Object.values(files)
    ) {

        for (
            const file
            of field
        ) {

            try {

                fs.unlinkSync(
                    file.path
                );

            }

            catch (error) {

                console.log(
                    "Could not delete temporary file:",
                    error.message
                );

            }

        }

    }

}


// ============================================
// GET CURRENT DATE AND TIME
// ETHIOPIA TIME — AFRICA/ADDIS_ABABA
// ============================================

function getTimestamp() {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone:
                "Africa/Addis_Ababa",

            year:
                "numeric",

            month:
                "short",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit",

            hour12:
                true
        }
    ).format(
        new Date()
    );

}


// ============================================
// GET STATUS DISPLAY
// ============================================

function getStatusDisplay(status) {

    switch (status) {

        case "verified":

            return {
                icon:
                    "🟢",

                text:
                    "PAYMENT VERIFIED"
            };


        case "rejected":

            return {
                icon:
                    "🔴",

                text:
                    "PAYMENT REJECTED"
            };


        case "preparing":

            return {
                icon:
                    "👩‍🍳",

                text:
                    "PREPARING"
            };


        case "ready":

            return {
                icon:
                    "📦",

                text:
                    "READY FOR PICKUP / DELIVERY"
            };


        case "delivered":

            return {
                icon:
                    "🚚",

                text:
                    "DELIVERED"
            };


        case "cancelled":

            return {
                icon:
                    "❌",

                text:
                    "CANCELLED"
            };


        default:

            return {
                icon:
                    "🟡",

                text:
                    "PAYMENT PENDING"
            };

    }

}


// ============================================
// ADD STATUS HISTORY ENTRY
// ============================================

function addStatusUpdate(
    messageText,
    status
) {

    const display =
        getStatusDisplay(
            status
        );


    const timestamp =
        getTimestamp();


    const statusUpdate = `

━━━━━━━━━━━━━━━━━━━━

${display.icon} <b>${display.text}</b>

🕐 ${escapeHTML(timestamp)}`;


    return (
        messageText.trim() +
        statusUpdate
    );

}


// ============================================
// CREATE ORDER MESSAGE
// ============================================

function createOrderMessage(
    orderId,
    data
) {

    return `🎂 <b>NEW HANIT BAKERY ORDER</b>

━━━━━━━━━━━━━━━━━━━━

🆔 <b>ORDER #${escapeHTML(orderId)}</b>

👤 <b>CUSTOMER</b>

${escapeHTML(
    data.name ||
    "Not provided"
)}

📞 ${escapeHTML(
    data.phone ||
    "Not provided"
)}

📧 ${escapeHTML(
    data.email ||
    "Not provided"
)}


🍰 <b>CAKE</b>

${escapeHTML(
    data.cake ||
    "Custom Cake"
)}

🍫 <b>Flavor:</b>
${escapeHTML(
    data.flavor ||
    "Not provided"
)}

📏 <b>Size:</b>
${escapeHTML(
    data.size ||
    "Not provided"
)}

🔢 <b>Quantity:</b>
${escapeHTML(
    data.quantity ||
    "1"
)}


🎉 <b>OCCASION</b>

${escapeHTML(
    data.occasion ||
    "Not provided"
)}


🚚 <b>ORDER METHOD</b>

${escapeHTML(
    data.method ||
    "Not provided"
)}

📍 <b>ADDRESS:</b>

${escapeHTML(
    data.address ||
    "Not applicable"
)}


📅 <b>DATE:</b>

${escapeHTML(
    data.date ||
    "Not provided"
)}

⏰ <b>TIME:</b>

${escapeHTML(
    data.time ||
    "Not provided"
)}


💳 <b>PAYMENT</b>

${escapeHTML(
    data.paymentMethod ||
    "Not provided"
)}

💰 <b>TOTAL:</b>

${escapeHTML(
    data.total ||
    "Not specified"
)} ETB


📝 <b>NOTES</b>

${escapeHTML(
    data.notes ||
    "None"
)}

━━━━━━━━━━━━━━━━━━━━

📸 <b>CAKE INSPIRATION:</b>
See attached reply below.

🧾 <b>PAYMENT RECEIPT:</b>
See attached reply below.

━━━━━━━━━━━━━━━━━━━━

🟡 <b>STATUS: PAYMENT PENDING</b>`;

}


// ============================================
// ORDER ENDPOINT
// ============================================

app.post(

    "/api/orders",

    upload.fields([

        {
            name:
                "inspiration",

            maxCount:
                1
        },

        {
            name:
                "paymentScreenshot",

            maxCount:
                1
        }

    ]),

    async (req, res) => {

        try {

            // ==================================
            // GENERATE ORDER ID
            // ==================================

            const orderId =
                generateOrderId();


            // ==================================
            // GET ORDER DATA
            // ==================================

            const {

                name,
                phone,
                email,

                cake,
                flavor,
                size,
                quantity,

                occasion,

                method,
                address,

                date,
                time,

                paymentMethod,

                notes,
                total

            } = req.body;


            // ==================================
            // CREATE MAIN ORDER MESSAGE
            // ==================================

            const message =
                createOrderMessage(

                    orderId,

                    {

                        name,
                        phone,
                        email,

                        cake,
                        flavor,
                        size,
                        quantity,

                        occasion,

                        method,
                        address,

                        date,
                        time,

                        paymentMethod,

                        notes,
                        total

                    }

                );


            // ==================================
            // CREATE INITIAL BUTTONS
            // ==================================

            const buttons =
                createOrderButtons(

                    orderId,

                    "pending"

                );


            // ==================================
            // SEND MAIN ORDER MESSAGE
            // ==================================

            const telegramResult =
                await sendTelegramMessage(

                    message,

                    buttons

                );


            if (!telegramResult.ok) {

                throw new Error(

                    telegramResult.description ||
                    "Telegram could not receive the order."

                );

            }


            const orderMessageId =
                telegramResult.result.message_id;


            console.log(
                `✅ Order ${orderId} sent to Telegram.`
            );


            // ==================================
            // SEND INSPIRATION IMAGE
            // AS REPLY
            // ==================================

            if (

                req.files &&

                req.files.inspiration &&

                req.files.inspiration[0]

            ) {

                const file =
                    req.files.inspiration[0];


                const result =
                    await sendTelegramPhoto(

                        file.path,

                        `📸 <b>Cake inspiration — #${escapeHTML(orderId)}</b>`,

                        orderMessageId

                    );


                if (!result.ok) {

                    console.error(

                        "❌ Inspiration upload failed:",

                        result.description

                    );

                }

            }


            // ==================================
            // SEND PAYMENT SCREENSHOT
            // AS REPLY
            // ==================================

            if (

                req.files &&

                req.files.paymentScreenshot &&

                req.files.paymentScreenshot[0]

            ) {

                const file =
                    req.files.paymentScreenshot[0];


                const result =
                    await sendTelegramPhoto(

                        file.path,

                        `🧾 <b>Payment receipt — #${escapeHTML(orderId)}</b>`,

                        orderMessageId

                    );


                if (!result.ok) {

                    console.error(

                        "❌ Payment screenshot upload failed:",

                        result.description

                    );

                }

            }


            // ==================================
            // DELETE TEMPORARY FILES
            // ==================================

            deleteUploadedFiles(
                req.files
            );


            // ==================================
            // SEND SUCCESS RESPONSE
            // ==================================

            res.json({

                success:
                    true,

                orderId:
                    orderId

            });

        }

        catch (error) {

            console.error(
                "❌ ORDER ERROR:",
                error
            );


            deleteUploadedFiles(
                req.files
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Could not submit order."

            });

        }

    }

);


// ============================================
// TELEGRAM WEBHOOK
// ============================================

app.post(

    "/telegram-webhook",

    async (req, res) => {

        try {

            const update =
                req.body;


            // ==================================
            // IGNORE NON-BUTTON UPDATES
            // ==================================

            if (
                !update.callback_query
            ) {

                return res.sendStatus(
                    200
                );

            }


            const callback =
                update.callback_query;


            const callbackData =
                callback.data;


            const message =
                callback.message;


            if (!message) {

                return res.sendStatus(
                    200
                );

            }


            const chatId =
                message.chat.id;


            const messageId =
                message.message_id;


            // ==================================
            // ONLY ACCEPT OUR CHAT
            // ==================================

            if (

                String(chatId) !==
                String(CHAT_ID)

            ) {

                return res.sendStatus(
                    200
                );

            }


            // ==================================
            // DETERMINE ACTION
            // ==================================

            let newStatus =
                null;


            let answerText =
                "";


            if (

                callbackData.startsWith(
                    "verify_"
                )

            ) {

                newStatus =
                    "verified";

                answerText =
                    "🟢 Payment verified!";

            }


            else if (

                callbackData.startsWith(
                    "reject_"
                )

            ) {

                newStatus =
                    "rejected";

                answerText =
                    "🔴 Payment rejected.";

            }


            else if (

                callbackData.startsWith(
                    "preparing_"
                )

            ) {

                newStatus =
                    "preparing";

                answerText =
                    "👩‍🍳 Order is now preparing.";

            }


            else if (

                callbackData.startsWith(
                    "ready_"
                )

            ) {

                newStatus =
                    "ready";

                answerText =
                    "📦 Order is ready.";

            }


            else if (

                callbackData.startsWith(
                    "delivered_"
                )

            ) {

                newStatus =
                    "delivered";

                answerText =
                    "🚚 Order marked as delivered.";

            }


            else if (

                callbackData.startsWith(
                    "cancel_"
                )

            ) {

                newStatus =
                    "cancelled";

                answerText =
                    "❌ Order cancelled.";

            }


            else {

                return res.sendStatus(
                    200
                );

            }


            // ==================================
            // GET ORDER ID
            // ==================================

            const orderId =
                callbackData.substring(

                    callbackData.indexOf("_") +
                    1

                );


            // ==================================
            // ANSWER TELEGRAM BUTTON PRESS
            // ==================================

            await fetch(

                `${TELEGRAM_API}/answerCallbackQuery`,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            callback_query_id:
                                callback.id,

                            text:
                                answerText,

                            show_alert:
                                false

                        })

                }

            );


            // ==================================
            // GET CURRENT MESSAGE
            // ==================================

            const oldMessageText =
                message.text || "";


            // ==================================
            // ADD NEW STATUS TO HISTORY
            //
            // IMPORTANT:
            // We DO NOT replace the old status.
            // We APPEND the new status + timestamp.
            // ==================================

            const updatedText =
                addStatusUpdate(

                    oldMessageText,

                    newStatus

                );


            // ==================================
            // CREATE UPDATED BUTTONS
            // ==================================

            const updatedButtons =
                createOrderButtons(

                    orderId,

                    newStatus

                );


            // ==================================
            // PREPARE TELEGRAM EDIT
            // ==================================

            const editBody = {

                chat_id:
                    chatId,

                message_id:
                    messageId,

                text:
                    updatedText,

                parse_mode:
                    "HTML"

            };


            // ==================================
            // UPDATE BUTTONS
            // ==================================

            if (
                updatedButtons.length > 0
            ) {

                editBody.reply_markup = {

                    inline_keyboard:
                        updatedButtons

                };

            }

            else {

                editBody.reply_markup = {

                    inline_keyboard:
                        []

                };

            }


            // ==================================
            // EDIT TELEGRAM MESSAGE
            // ==================================

            const editResponse =
                await fetch(

                    `${TELEGRAM_API}/editMessageText`,

                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                editBody
                            )

                    }

                );


            const editResult =
                await editResponse.json();


            if (!editResult.ok) {

                console.error(

                    "❌ Telegram message update failed:",

                    editResult

                );

            }

            else {

                console.log(

                    `✅ ${orderId} → ${newStatus} at ${getTimestamp()}`

                );

            }


            return res.sendStatus(
                200
            );

        }

        catch (error) {

            console.error(

                "❌ Telegram webhook error:",

                error

            );


            return res.sendStatus(
                200
            );

        }

    }

);


// ============================================
// TEST TELEGRAM ROUTE
// ============================================

app.get(

    "/test-telegram",

    async (req, res) => {

        try {

            const testOrder =

`🎂 <b>TEST — HANIT BAKERY</b>

━━━━━━━━━━━━━━━━━━━━

🆔 <b>ORDER #LC-TEST-001</b>

👤 <b>CUSTOMER</b>

Abigail

📞 09XXXXXXXX

📧 test@example.com


🍰 <b>CAKE</b>

Chocolate Birthday Cake

🍫 <b>Flavor:</b>
Chocolate

📏 <b>Size:</b>
2 KG

🔢 <b>Quantity:</b>
1


🎉 <b>OCCASION</b>

Birthday


🚚 <b>ORDER METHOD</b>

Delivery

📍 <b>ADDRESS:</b>

Bole, Addis Ababa


📅 <b>DATE:</b>

August 20, 2026

⏰ <b>TIME:</b>

3:00 PM


💳 <b>PAYMENT</b>

Telebirr

💰 <b>TOTAL:</b>

2,500 ETB


📝 <b>NOTES</b>

Please write "Happy Birthday"


━━━━━━━━━━━━━━━━━━━━

🟡 <b>STATUS: PAYMENT PENDING</b>`;


            const buttons =
                createOrderButtons(

                    "LC-TEST-001",

                    "pending"

                );


            const result =
                await sendTelegramMessage(

                    testOrder,

                    buttons

                );


            res.json({

                success:
                    true,

                telegramResponse:
                    result

            });

        }

        catch (error) {

            console.error(
                error
            );


            res.status(500).json({

                success:
                    false,

                error:
                    error.message

            });

        }

    }

);


// ============================================
// ROOT ROUTE
// ============================================

app.get(

    "/",

    (req, res) => {

        res.send(
            "🎂 Hanit Bakery Telegram backend is running!"
        );

    }

);


// ============================================
// START SERVER
// ============================================

const PORT =
    process.env.PORT || 3000;


app.listen(

    PORT,

    () => {

        console.log(

            `🎂 Hanit Bakery backend running on port ${PORT}`

        );

    }

);

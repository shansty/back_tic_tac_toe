import { google } from "googleapis";
import { getAuthenticatedClientForUser } from "../oAuth2Client";


export const createOrUpdateGameBoardSheet = async (
    user_id: number,
    rival_username: string,
    arr_x: number[],
    arr_o: number[],
    winningIndices: number[]
) => {

    const oAuth2Client = await getAuthenticatedClientForUser(user_id);

    const sheets = google.sheets({ version: "v4", auth: oAuth2Client });
    const drive = google.drive({ version: "v3", auth: oAuth2Client });
    const spreadsheetTitle = "Tic Tac Toe Challenge Results";

    try {
        const driveResponse = await drive.files.list({
            q: `name='${spreadsheetTitle}' and mimeType='application/vnd.google-apps.spreadsheet'`,
            spaces: "drive",
            fields: "files(id, name)",
        });

        let spreadsheetId: string;
        let sheetId: number | null | undefined;

        if (driveResponse.data.files && driveResponse.data.files.length > 0) {
            console.log("Spreadsheet found.");
            spreadsheetId = driveResponse.data.files[0].id!;

            const addSheetResponse = await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: `Game with ${rival_username}`,
                                },
                            },
                        },
                    ],
                },
            });

            sheetId = addSheetResponse.data.replies![0].addSheet!.properties!.sheetId;
        } else {
            console.log("Spreadsheet not found. Creating a new one...");
            const createResponse = await sheets.spreadsheets.create({
                requestBody: {
                    properties: {
                        title: spreadsheetTitle,
                    },
                    sheets: [
                        {
                            properties: {
                                title: `Game with ${rival_username}`,
                            },
                        },
                    ],
                },
            });

            spreadsheetId = createResponse.data.spreadsheetId!;
            sheetId = createResponse.data.sheets![0].properties!.sheetId;
        }

        const board = Array(3)
            .fill(null)
            .map(() => Array(3).fill(""));

        arr_x.forEach((index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            board[row][col] = "X";
        });

        arr_o.forEach((index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            board[row][col] = "O";
        });

        const updateRequests: any[] = [
            {
                updateCells: {
                    range: {
                        sheetId: sheetId,
                        startRowIndex: 0,
                        endRowIndex: 3,
                        startColumnIndex: 0,
                        endColumnIndex: 3,
                    },
                    rows: board.map((row) => ({
                        values: row.map((value) => ({
                            userEnteredValue: { stringValue: value },
                            userEnteredFormat: {
                                borders: {
                                    top: { style: "SOLID", width: 1 },
                                    bottom: { style: "SOLID", width: 1 },
                                    left: { style: "SOLID", width: 1 },
                                    right: { style: "SOLID", width: 1 },
                                },
                            },
                        })),
                    })),
                    fields: "userEnteredValue,userEnteredFormat.borders",
                },
            },
        ];
        if (winningIndices) {
            winningIndices.forEach((index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                updateRequests.push({
                    repeatCell: {
                        range: {
                            sheetId,
                            startRowIndex: row,
                            endRowIndex: row + 1,
                            startColumnIndex: col,
                            endColumnIndex: col + 1,
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: {
                                    red: 1.0,
                                    green: 0.6,
                                    blue: 0.0,
                                },
                            },
                        },
                        fields: "userEnteredFormat.backgroundColor",
                    },
                });
            });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: updateRequests,
            },
        })
        console.log(`Spreadsheet updated successfully. URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
    } catch (error) {
        console.error("Error managing game board:", error);
    }
};
"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../utils/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { SessionProvider } from "next-auth/react";
import { ChatContextProvider } from "@/context/ChatContext";
import Navbar from "@/components/Navbar";
import { Box } from "@mui/material";

interface RootLayoutProps {
    children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
    return (
        <html lang="en">
            <head>
                <title>BuildBuddy</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body>
                <Box height={"100vh"} bgcolor={"#121212"}>
                    <AppRouterCacheProvider>
                        <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <ChatContextProvider>
                                <SessionProvider>
                                    <Navbar />
                                    <Box display="flex" flexDirection="column" height="calc(100vh - 64px)" overflow="auto">
                                        {children}
                                    </Box>
                                </SessionProvider>
                            </ChatContextProvider>
                        </ThemeProvider>
                    </AppRouterCacheProvider>
                </Box>
            </body>
        </html>
    );
};

export default RootLayout;

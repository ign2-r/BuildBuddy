"use client";

import { useChatContext } from "@/context/ChatContext";
import { Box, Typography, Card, CardContent, CardActions, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Part = {
    _id: string;
    name: string;
    msrpPrice?: number | string;
    link?: string;
    links?: { vendor: string; url: string }[];
};

const RecommendationPanel: React.FC = () => {
    const { recommendations } = useChatContext();
    const [parts, setParts] = useState<[string, Part][]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setParts(
            Object.entries(recommendations.at(-1) || {})
                .filter(([category]) => !["_id", "display", "createdAt", "updatedAt"].includes(category))
                .map(([category, part]) => [category, part as unknown as Part])
        );
        return;
      }, [recommendations]);
      
      useEffect(() => {
        setTotal(
            parts.reduce((acc, [, part]) => {
                const price = typeof part.msrpPrice === "number" ? part.msrpPrice : parseFloat(part.msrpPrice || "0");
                return acc + (isNaN(price) ? 0 : price);
            }, 0)
        );
        return;
      }, [parts])
      
    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                🧩 Recommended Parts
            </Typography>

            <AnimatePresence mode="wait">
                {parts.length === 0 ? (
                    <Box
                        key="placeholder"
                        sx={{ p: 3, textAlign: "center", color: "grey.500" }}
                    >
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Talk to BuildBuddy to get a Recommendation!
                        </Typography>
                        <Typography variant="body2">
                            Start a conversation to see your recommended PC parts here.
                        </Typography>
                    </Box>
                ) : (
                    <motion.div
                        key="recommendations"
                        initial={{ opacity: 0, y: 40, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 120, damping: 16 }}
                    >
                        {parts.map(([category, part]) => (
                            <Card key={`${part._id}_${category}`} sx={{ mb: 2, bgcolor: "#2e2e2e", color: "white" }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {category.toUpperCase()}
                                    </Typography>
                                    <Typography>{part.name}</Typography>
                                    {part.msrpPrice && (
                                        <Typography>
                                            💵 ${typeof part.msrpPrice === "number"
                                                ? part.msrpPrice.toFixed(2)
                                                : parseFloat(part.msrpPrice).toFixed(2)}
                                        </Typography>
                                    )}
                                    {/* Shop buttons */}
                                    {Array.isArray(part.links) && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                            {["Amazon", "Newegg", "eBay"].map((vendor) => {
                                                const linkObj = part.links.find(l => l.vendor?.toLowerCase() === vendor.toLowerCase());
                                                return linkObj ? (
                                                    <Button
                                                        key={vendor}
                                                        href={linkObj.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            color: 'white',
                                                            borderColor: 'white',
                                                            '&:hover': { bgcolor: '#333', borderColor: '#fff' }
                                                        }}
                                                    >
                                                        {vendor}
                                                    </Button>
                                                ) : null;
                                            })}
                                        </Box>
                                    )}
                                </CardContent>
                                {part.link && (
                                    <CardActions>
                                        <Button
                                            href={part.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="outlined"
                                            color="info"
                                        >
                                            View Product
                                        </Button>
                                    </CardActions>
                                )}
                            </Card>
                        ))}

                        <Typography sx={{ mt: 2, color: 'white' }}>
                            <span role="img" aria-label="money">🧾</span> Total: ${total}
                        </Typography>

                        <Box mt={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => window.location.href = '/guide'}
                            >
                                🛠 Let&apos;s Build It
                            </Button>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default RecommendationPanel;

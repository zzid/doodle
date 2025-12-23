import React from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { motion } from "framer-motion";

const PageContainer = styled.div`
    padding: 48px 24px;
    max-width: 1200px;
    margin: 0 auto;
    color: #ffffff;
    min-height: 100vh;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
`;

const Subtitle = styled.p`
    font-size: 1.1rem;
    color: #a0a0a0;
    text-align: center;
    margin-bottom: 48px;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 32px;
`;

const Card = styled(motion(Link))`
    display: block;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 24px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);

    &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
`;

const CardTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #ffffff;
`;

const CardDescription = styled.p`
    font-size: 0.9rem;
    color: #b0b0b0;
    line-height: 1.5;
    margin: 0;
`;

const CardPath = styled.div`
    font-size: 0.75rem;
    color: #888;
    margin-top: 12px;
    font-family: monospace;
    opacity: 0.7;
`;

const pageData = [
    {
        path: "/calendar",
        title: "Event Calendar",
        description: "Interactive calendar with event tracking and cumulative count system",
        emoji: "📅",
    },
    {
        path: "/symbol",
        title: "Symbol Calculator",
        description: "Tools for calculating symbol advantages and forces",
        emoji: "⚡",
    },
    {
        path: "/exp-coupon",
        title: "Experience Coupon",
        description: "Utility for experience coupon calculations",
        emoji: "🎫",
    },
    {
        path: "/motion",
        title: "Motion Examples",
        description: "Various motion and animation demonstrations",
        emoji: "🎬",
    },
    {
        path: "/event-2412",
        title: "Event 2412",
        description: "Event calendar and tracking for December 2024",
        emoji: "🎉",
    },
    {
        path: "/event-2408",
        title: "Event 2408",
        description: "Event tracking and coin shop for August 2024",
        emoji: "🪙",
    },
    {
        path: "/maple-calendar",
        title: "Maple Calendar",
        description: "MapleStory event calendar viewer",
        emoji: "🍁",
    },
    {
        path: "/app",
        title: "App",
        description: "Main application page",
        emoji: "🚀",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
};

export const HomePage = () => {
    return (
        <PageContainer>
            <Title>Doodle</Title>
            <Subtitle>Utility tools and interactive components</Subtitle>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Grid>
                    {pageData.map((page) => (
                        <Card
                            key={page.path}
                            to={page.path}
                            variants={cardVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <CardTitle>
                                <span style={{ marginRight: "8px" }}>
                                    {page.emoji}
                                </span>
                                {page.title}
                            </CardTitle>
                            <CardDescription>{page.description}</CardDescription>
                            <CardPath>{page.path}</CardPath>
                        </Card>
                    ))}
                </Grid>
            </motion.div>
        </PageContainer>
    );
};


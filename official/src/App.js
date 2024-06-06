// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import Profile from './components/Profile';
import AddPost from './components/AddPost';
import LinksForm from './components/LinksForm';
import Footer from './components/Footer';
import { Container } from '@mui/material';

const App = () => {
    const [isAddingPost, setIsAddingPost] = useState(false);

    const handleAddPostClick = () => {
        setIsAddingPost(true);
    };

    const handleCancelAddPost = () => {
        setIsAddingPost(false);
    };

    return (
        <div>
            <Header onAddPostClick={handleAddPostClick} />
            <Container>
                {isAddingPost ? (
                    <AddPost onCancel={handleCancelAddPost} />
                ) : (
                    <>
                        <Profile />
                        <LinksForm />
                    </>
                )}
            </Container>
            <Footer />
        </div>
    );
};

export default App;

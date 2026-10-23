import React from "react";

import {
  Routes,
  Route,
} from "react-router-dom";

/* ==================================================
   PÁGINAS PRINCIPAIS
================================================== */

import Splash from "../Pages/Splash";
import Home from "../Pages/Home";
import Login from "../Pages/Login";
import Register from "../Pages/Register";

/* ==================================================
   EXPLORAR / PESQUISA
================================================== */

import Explore from "../Pages/Explore";
import Search from "../Pages/Search";

/* ==================================================
   CRIAÇÃO DE CONTEÚDO
================================================== */

import CreatePost from "../Pages/CreatePost";
import CreateStory from "../Pages/CreateStory";
import CreateLive from "../Pages/CreateLive";

/* ==================================================
   POSTS / STORIES
================================================== */

import Post from "../Pages/Post";
import Stories from "../Pages/Stories";
import Story from "../Pages/Story";

/* ==================================================
   PERFIL
================================================== */

import Profile from "../Pages/Profile";
import EditProfile from "../Pages/EditProfile";

/* ==================================================
   NOTIFICAÇÕES / MENSAGENS
================================================== */

import Notifications from "../Pages/Notifications";
import Messages from "../Pages/Messages";
import Chat from "../Pages/Chat";

/* ==================================================
   AMIGOS / VÍDEOS / LIVE
================================================== */

import Friends from "../Pages/Friends";
import Videos from "../Pages/Videos";
import Live from "../Pages/Live";
import WatchLive from "../Pages/WatchLive";

/* ==================================================
   SALA VIP
================================================== */

import SalaVIP from "../Pages/SalaVIP";

/* ==================================================
   CONFIGURAÇÕES
================================================== */

import Settings from "../Pages/Settings";
import Privacy from "../Pages/Privacy";
import Security from "../Pages/Security";

/* ==================================================
   SEGUIDORES
================================================== */

import Followers from "../Pages/Followers";
import Following from "../Pages/Following";

/* ==================================================
   PUBLICAÇÕES GUARDADAS / GOSTOS
================================================== */

import SavedPosts from "../Pages/SavedPosts";
import LikedPosts from "../Pages/LikedPosts";

/* ==================================================
   INFORMAÇÕES / AJUDA
================================================== */

import About from "../Pages/About";
import Help from "../Pages/Help";

/* ==================================================
   ERRO
================================================== */

import NotFound from "../Pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ==================================================
          AUTENTICAÇÃO
      ================================================== */}

      <Route
        path="/"
        element={<Splash />}
      />

      <Route
        path="/splash"
        element={<Splash />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ==================================================
          HOME
      ================================================== */}

      <Route
        path="/home"
        element={<Home />}
      />

      {/* ==================================================
          EXPLORAR / PESQUISA
      ================================================== */}

      <Route
        path="/explore"
        element={<Explore />}
      />

      <Route
        path="/search"
        element={<Search />}
      />

      {/* ==================================================
          CRIAR CONTEÚDO
      ================================================== */}

      <Route
        path="/create-post"
        element={<CreatePost />}
      />

      <Route
        path="/create-story"
        element={<CreateStory />}
      />

      <Route
        path="/live/create"
        element={<CreateLive />}
      />

      {/* ==================================================
          POSTS
      ================================================== */}

      <Route
        path="/post/:id"
        element={<Post />}
      />

      {/* ==================================================
          STORIES
      ================================================== */}

      <Route
        path="/stories"
        element={<Stories />}
      />

      <Route
        path="/stories/:id"
        element={<Story />}
      />

      {/* ==================================================
          PERFIL
      ================================================== */}

      <Route
        path="/profile"
        element={<Profile />}
      />

      <Route
        path="/profile/:id"
        element={<Profile />}
      />

      <Route
        path="/edit-profile"
        element={<EditProfile />}
      />

      {/* ==================================================
          NOTIFICAÇÕES
      ================================================== */}

      <Route
        path="/notifications"
        element={<Notifications />}
      />

      {/* ==================================================
          MENSAGENS
      ================================================== */}

      <Route
        path="/messages"
        element={<Messages />}
      />

      <Route
        path="/chat"
        element={<Chat />}
      />

      <Route
        path="/chat/:id"
        element={<Chat />}
      />

      {/* ==================================================
          AMIGOS
      ================================================== */}

      <Route
        path="/friends"
        element={<Friends />}
      />

      {/* ==================================================
          VÍDEOS / REELS
      ================================================== */}

      <Route
        path="/videos"
        element={<Videos />}
      />

      {/* ==================================================
          LIVE / TRANSMISSÕES
      ================================================== */}

      <Route
        path="/live"
        element={<Live />}
      />

      {/* SALA PARA ASSISTIR À LIVE */}
      <Route
        path="/live/watch/:id"
        element={<WatchLive />}
      />

      {/* ==================================================
          SALA VIP
      ================================================== */}

      <Route
        path="/sala-vip"
        element={<SalaVIP />}
      />

      {/* ==================================================
          CONFIGURAÇÕES
      ================================================== */}

      <Route
        path="/settings"
        element={<Settings />}
      />

      <Route
        path="/privacy"
        element={<Privacy />}
      />

      <Route
        path="/security"
        element={<Security />}
      />

      {/* ==================================================
          SEGUIDORES
      ================================================== */}

      <Route
        path="/followers"
        element={<Followers />}
      />

      <Route
        path="/following"
        element={<Following />}
      />

      {/* ==================================================
          PUBLICAÇÕES
      ================================================== */}

      <Route
        path="/saved-posts"
        element={<SavedPosts />}
      />

      <Route
        path="/liked-posts"
        element={<LikedPosts />}
      />

      {/* ==================================================
          SOBRE / AJUDA
      ================================================== */}

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/help"
        element={<Help />}
      />

      {/* ==================================================
          PÁGINA NÃO ENCONTRADA
      ================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}
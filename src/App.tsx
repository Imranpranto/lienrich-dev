import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FeatureCards from './components/FeatureCards';
import CreditStats from './components/CreditStats';
import ServicesGrid from './components/ServicesGrid';
import ServiceDetails from './pages/ServiceDetails';
import Operations from './pages/Operations';
import ProfilePostCommentators from './pages/ProfilePostCommentators';
import GetPostReactions from './pages/GetPostReactions';
import Integrations from './pages/Integrations';
import ProfilePosts from './pages/ProfilePosts';
import CompanyPosts from './pages/CompanyPosts';
import Leads from './pages/Leads';
import ProfileDataByUrl from './pages/ProfileDataByUrl';
import ArticleComments from './pages/ArticleComments';
import ArticleReactions from './pages/ArticleReactions';
import Settings from './pages/Settings';
import { ServicesProvider } from './contexts/ServicesContext';

function App() {
  return (
    <ServicesProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex">
                  <Sidebar />
                  <div className="flex-1 flex flex-col ml-16">
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={
                          <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                      <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
                        <p className="text-gray-500">A reliable Company to search & enrich LinkedIn things</p>
                      </div>
                        <div className="mb-8">
                          <CreditStats />
                        </div>
                        <div className="mb-8">
                          <FeatureCards />
                        </div>
                        <div className="mb-8">
                          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Operations</h2>
                          <ServicesGrid />
                        </div>
                    </div>
                          </div>
                        } />
                        <Route path="/service/:serviceId" element={<ServiceDetails />} />
                        <Route path="/operations" element={<Operations />} />
                        <Route path="/get-post-reactions" element={<GetPostReactions />} />
                        <Route path="/profile-post-commentators" element={<ProfilePostCommentators />} />
                        <Route path="/profile-posts" element={<ProfilePosts />} />
                        <Route path="/company-posts" element={<CompanyPosts />} />
                        <Route path="/profile-data-by-url" element={<ProfileDataByUrl />} />
                        <Route path="/article-comments" element={<ArticleComments />} />
                        <Route path="/article-reactions" element={<ArticleReactions />} />
                        <Route path="*" element={<Navigate to="/" replace={true} />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ServicesProvider>
  );
}

export default App;
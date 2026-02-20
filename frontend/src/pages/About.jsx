import React from 'react';

export const About = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="flex justify-center mb-4">
                    <svg
                        className="w-20 h-20 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                    À propos de TaskFlow
                </h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                    Votre plateforme collaborative de gestion de projets et de tâches.
                </p>
            </div>

            <div className="space-y-16">
                {/* Définition */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm">01</span>
                        Qu'est-ce que TaskFlow ?
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            TaskFlow est une application de gestion de projets full-stack conçue pour aider les équipes et les individus à organiser leur travail, suivre leur progression et collaborer en temps réel. Développé dans un souci d'efficacité et de simplicité, cet outil permet de transformer le chaos des tâches quotidiennes en un flux de travail structuré et productif.
                        </p>
                    </div>
                </section>

                {/* Technologies */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm">02</span>
                        Technologies utilisées
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Frontend
                            </h3>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    <strong>React 18</strong> - Bibliothèque UI moderne
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    <strong>Tailwind CSS</strong> - Design premium et responsive
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    <strong>Laravel Echo</strong> - Mises à jour en temps réel
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                Backend
                            </h3>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    <strong>Laravel 12</strong> - Framework PHP robuste
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    <strong>Laravel Reverb</strong> - Serveur WebSocket haute performance
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    <strong>MySQL/SQLite</strong> - Stockage de données sécurisé
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Comment utiliser */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm">03</span>
                        Comment utiliser TaskFlow
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2">
                        <div className="space-y-1">
                            {[
                                { title: "S'inscrire et se connecter", desc: "Créez votre compte personnel pour accéder à votre tableau de bord." },
                                { title: "Créer un projet", desc: "Organisez vos tâches par projet. Donnez-lui un nom, une description et une date d'échéance." },
                                { title: "Gérer vos tâches", desc: "Ajoutez des tâches, définissez leur priorité et assignez-les à des membres de l'équipe." },
                                { title: "Suivre la progression", desc: "Utilisez la vue Kanban pour déplacer vos tâches entre 'À faire', 'En cours' et 'Terminé'." },
                                { title: "Vue Calendrier", desc: "Visualisez vos échéances importantes sur un calendrier interactif." }
                            ].map((step, idx) => (
                                <div key={idx} className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{step.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Documentation */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm">04</span>
                        Documentation additionnelle
                    </h2>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-8 text-center">
                        <p className="text-blue-800 dark:text-blue-300 mb-6 font-medium">
                            Ce projet a été réalisé avec une architecture moderne séparant le Frontend (SPA) et le Backend (API REST).
                            Le système intègre l'authentification avec Laravel Sanctum et une gestion d'état réactive côté client.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 shadow-sm">
                                Clean Code
                            </span>
                            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 shadow-sm">
                                Responsive Design
                            </span>
                            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 shadow-sm">
                                Real-time Sync
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-500 text-sm">
                &copy; 2026 TaskFlow - Projet Portfolio OFPPT
            </footer>
        </div>
    );
};

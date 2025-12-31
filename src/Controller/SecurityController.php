<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class SecurityController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private TokenStorageInterface $tokenStorage,
        private RequestStack $requestStack
    ) {
    }

    #[Route(path: '/login', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }



    #[Route(path: '/admin-login', name: 'app_admin_login')]
    public function adminLogin(Request $request, #[CurrentUser] $user = null): Response
    {
        // Debug: method called
        error_log('Admin login method called');

        // If user is already logged in, redirect to admin
        if ($user && in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->redirectToRoute('admin');
        }

        $error = null;
        $success = null;

        if ($request->isMethod('POST')) {
            $error = 'POST request received';
            // Temporarily disable CSRF for testing
            // $submittedToken = $request->request->get('_csrf_token');
            // if (!$this->isCsrfTokenValid('admin_login', $submittedToken)) {
            //     $error = 'Token CSRF invalide.';
            // } else {
            {
                $adminCode = $request->request->get('admin_code');
                $error = 'Debug: adminCode = "' . $adminCode . '"';

                    if ($adminCode === '180201') {
                        // Use the admin user from fixtures and authenticate properly
                        $adminUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => 'admin@bibliogest.com']);

                    if (!$adminUser) {
                        $error = 'Utilisateur admin non trouvé. Veuillez exécuter les fixtures.';
                    } else {
                        // Authenticate the user using Symfony's security system
                        // We'll use the password hasher to verify and then set the token
                        $token = new UsernamePasswordToken(
                            $adminUser,
                            'admin_login',
                            [] // Use empty roles to avoid array conversion issues
                        );

                        $this->tokenStorage->setToken($token);

                        // Store in session
                        $session = $this->requestStack->getCurrentRequest()->getSession();
                        $session->set('_security_main', serialize($token));

                        $success = 'Connexion administrateur réussie ! Redirection vers le panneau d\'administration...';

                        return $this->render('security/admin_login.html.twig', [
                            'error' => null,
                            'success' => $success,
                        ]);
                    }
                } else {
                    $error = 'Code secret incorrect.';
                }
            }
        }

        return $this->render('security/admin_login.html.twig', [
            'error' => $error,
            'success' => $success,
        ]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): Response
    {
        return $this->redirectToRoute('app_main');
        //throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    // public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    // {
    //     // rediriger vers une route nommée
    //     return $this->redirectToRoute('app_main');
    // }
}

<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\BookRepository;

final class LivreController extends AbstractController
{
    #[Route('/livre', name: 'app_livre')]
    public function index(BookRepository $repo): Response
    {
        $livres = $repo->findAll();
        return $this->render('livre/index.html.twig', [
            'livres' => $livres,
        ]);
    }

    /**
     * @Route("/livres", name="liste_livres")
     */
    public function listeLivres(BookRepository $repo): Response {
        $livres = $repo->findAll();
        return $this->render('livre/index.html.twig', ['livres' => $livres]);
    }

    /**
     * @Route("/livre/{id}", name="livre_detail")
     */
    public function detailLivre(int $id, BookRepository $repo): Response {
        $livre = $repo->find($id);
        if (!$livre) {
            throw $this->createNotFoundException('Livre non trouvé');
        }
        return $this->render('livre/detail.html.twig', ['livre' => $livre]);
    }
}

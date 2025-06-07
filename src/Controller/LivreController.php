<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\BookRepository;
use App\Form\CommentType;
use App\Entity\Comment;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;

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
    public function detailLivre(int $id, BookRepository $repo, Request $request, EntityManagerInterface $em): Response {
        $livre = $repo->find($id);
        if (!$livre) {
            throw $this->createNotFoundException('Livre non trouvé');
        }
        $comment = new Comment();
        $comment->setBook($livre);
        $form = $this->createForm(CommentType::class, $comment);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($comment);
            $em->flush();
            return $this->redirectToRoute('livre_detail', ['id' => $livre->getId()]);
        }
        return $this->render('livre/detail.html.twig', [
            'livre' => $livre,
            'commentForm' => $form->createView(),
        ]);
    }
}

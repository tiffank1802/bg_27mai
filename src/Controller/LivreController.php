<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\BookRepository;
use App\Form\CommentType;
use App\Entity\Comment;
use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

final class LivreController extends AbstractController
{
    #[Route('/livre', name: 'app_livre')]
    public function index(BookRepository $repo, Request $request): Response
    {
        $page = $request->query->getInt('page', 1);
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $query = $repo->createQueryBuilder('b')
            ->leftJoin('b.authors', 'a')
            ->leftJoin('b.editor', 'e')
            ->addSelect('a', 'e')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery();

        $livres = $query->getResult();

        // Get total count for pagination
        $totalBooks = $repo->createQueryBuilder('b')
            ->select('COUNT(b.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $totalPages = ceil($totalBooks / $limit);

        return $this->render('livre/index.html.twig', [
            'livres' => $livres,
            'currentPage' => $page,
            'totalPages' => $totalPages,
        ]);
    }

    #[Route('/livres', name: 'liste_livres')]
    public function listeLivres(BookRepository $repo, Request $request): Response {
        $page = $request->query->getInt('page', 1);
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $query = $repo->createQueryBuilder('b')
            ->leftJoin('b.authors', 'a')
            ->leftJoin('b.editor', 'e')
            ->addSelect('a', 'e')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery();

        $livres = $query->getResult();

        // Get total count for pagination
        $totalBooks = $repo->createQueryBuilder('b')
            ->select('COUNT(b.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $totalPages = ceil($totalBooks / $limit);

        return $this->render('livre/index.html.twig', [
            'livres' => $livres,
            'currentPage' => $page,
            'totalPages' => $totalPages,
        ]);
    }

    #[Route('/livre/{id}', name: 'livre_detail')]
    #[Route('/livre/{id}/reserve', name: 'livre_reserve', methods: ['POST'])]
    public function detailLivre(int $id, BookRepository $repo, Request $request, EntityManagerInterface $em): Response {
        $livre = $repo->createQueryBuilder('b')
            ->leftJoin('b.authors', 'a')
            ->leftJoin('b.editor', 'e')
            ->addSelect('a', 'e')
            ->where('b.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
        if (!$livre) {
            throw $this->createNotFoundException('Livre non trouvé');
        }

        $user = $this->getUser();
        $canReserve = $user && $livre->getStatus() === \App\Enum\BookStatus::Available;
        $currentReservation = null;
        if ($livre->getStatus() === \App\Enum\BookStatus::Borrowed) {
            $currentReservation = $em->getRepository(Reservation::class)->findOneBy(['book' => $livre], ['reservedAt' => 'DESC']);
        }

        // Handle reservation
        if ($request->isMethod('POST') && $request->request->get('reserve') && $canReserve) {
            $duration = (int) $request->request->get('duration', 5);
            if (!in_array($duration, [2, 5, 10])) {
                $duration = 5;
            }
            $reservation = new Reservation();
            $reservation->setUser($user);
            $reservation->setBook($livre);
            $reservation->setReservedAt(new \DateTimeImmutable());
            $reservation->setReturnAt((new \DateTimeImmutable())->modify("+$duration minutes"));

            $livre->setStatus(\App\Enum\BookStatus::Borrowed);

            $em->persist($reservation);
            $em->flush();

            // Send email (disabled in dev)
            // $email = (new Email())
            //     ->from('noreply@bibliogest.com')
            //     ->to($user->getEmail())
            //     ->subject('Réservation confirmée')
            //     ->text("Vous avez réservé le livre '{$livre->getTitle()}' jusqu'au {$reservation->getReturnAt()->format('d/m/Y H:i')}.");

            // $mailer->send($email);

            $this->addFlash('success', 'Livre réservé avec succès !');
            return $this->redirectToRoute('livre_detail', ['id' => $livre->getId()]);
        }

        $comment = new Comment();
        $comment->setBook($livre);
        $form = $this->createForm(CommentType::class, $comment);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $comment->setIsbn($livre->getIsbn());
            $comment->setCover($livre->getCover() ?? 'default.png');
            $comment->setCreatedAt(new \DateTimeImmutable());
            $comment->setStatus([\App\Enum\CommentStatus::Published]);
            $em->persist($comment);
            $em->flush();
            return $this->redirectToRoute('livre_detail', ['id' => $livre->getId()]);
        }

        // Similar books
        $similarBooks = $repo->createQueryBuilder('b')
            ->leftJoin('b.authors', 'a')
            ->leftJoin('b.editor', 'e')
            ->addSelect('a', 'e')
            ->where('b.id != :currentId')
            ->andWhere('b.genre = :genre')
            ->setParameter('currentId', $livre->getId())
            ->setParameter('genre', $livre->getGenre())
            ->setMaxResults(4)
            ->getQuery()
            ->getResult();

        return $this->render('livre/detail.html.twig', [
            'livre' => $livre,
            'commentForm' => $form->createView(),
            'canReserve' => $canReserve,
            'similarBooks' => $similarBooks,
            'currentReservation' => $currentReservation,
            'returnAtString' => $currentReservation ? $currentReservation->getReturnAt()->format('Y-m-d H:i:s') : '',
        ]);
    }
}

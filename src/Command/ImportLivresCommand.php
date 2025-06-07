<?php

namespace App\Command;

use App\Entity\Author;
use App\Entity\Book;
use App\Entity\Editor;
use App\Enum\BookStatus;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'import:livres',
    description: 'Importe des livres depuis un fichier JSON',
)]
class ImportLivresCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('arg1', InputArgument::OPTIONAL, 'Argument description')
            ->addOption('option1', null, InputOption::VALUE_NONE, 'Option description')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $json = file_get_contents('public/livres.json');
        $data = json_decode($json, true);

        // Récupérer tous les auteurs et éditeurs existants
        $authors = $this->em->getRepository(Author::class)->findAll();
        $editors = $this->em->getRepository(Editor::class)->findAll();
        $statuses = BookStatus::cases();

        if (empty($authors) || empty($editors)) {
            $output->writeln('<error>Il faut au moins un auteur et un éditeur existants en base.</error>');
            return Command::FAILURE;
        }

        $authorCount = count($authors);
        $editorCount = count($editors);
        $statusCount = count($statuses);
        $status90 = (int) ceil($statusCount * 0.9);
        $statusPool = array_slice($statuses, 0, $status90);

        $i = 0;
        foreach ($data as $item) {
            $book = new Book();
            $book->setTitle($item['titre']);
            $book->setIsbn($item['isbn']);

            // Correction de la date : ignorer ou remplacer les dates invalides
            $dateString = $item['edited_at'];
            // Si la date est négative ou anormale, on met une date par défaut (ex: 2000-01-01)
            if (preg_match('/^-/', $dateString) || !preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/', $dateString) || (int)substr($dateString,0,4) < 1500) {
                $dateString = '2000-01-01';
            }
            $book->setEditedAt(new \DateTimeImmutable($dateString));

            $book->setPlot($item['plot']);
            $book->setPageNumber($item['page_number']);

            // Définir une cover par défaut si aucune n'est fournie
            $book->setCover('default.png');

            // Associer un auteur (en boucle)
            $author = $authors[$i % $authorCount];
            $book->addAuthor($author);

            // Associer un éditeur (en boucle)
            $editor = $editors[$i % $editorCount];
            $book->setEditor($editor);

            // Associer un statut (aléatoire parmi 90% des statuts)
            $status = $statusPool[array_rand($statusPool)];
            $book->setStatus($status);

            $this->em->persist($book);
            $i++;
        }
        $this->em->flush();

        $output->writeln('Livres importés avec succès !');
        return Command::SUCCESS;
    }
}
